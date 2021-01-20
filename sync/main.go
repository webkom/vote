package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"time"

	"github.com/gorilla/websocket"
)

var eventId = flag.Int("event", 0, "Event it to make users from")
var wsUrl = flag.String("socket-url", "", "Websocket url, full url w/token (look in console on abakus.no)")
var authCookieVote = flag.String("vote-cookie", "", "Vote cookie including the connect.sid=xasda")
var csrfToken = flag.String("csrf-token", "", "The token u know")
var voteEndpoint = flag.String("vote-endpoint", "", "usually ends on /api/user/generate")
var legoUserEndpont = flag.String("lego-user-endpoint", "", "usually ends on /api/v1/users/")

type LegoAction struct {
	Type string `json:"type"`
}
type LegoRegisterAction struct {
	Meta struct {
		EventID        int         `json:"eventId"`
		ActivationTime time.Time   `json:"activationTime"`
		FromPool       interface{} `json:"fromPool"`
	} `json:"meta"`
	Payload struct {
		ID   int `json:"id"`
		User struct {
			ID                   int    `json:"id"`
			Username             string `json:"username"`
			FirstName            string `json:"firstName"`
			LastName             string `json:"lastName"`
			FullName             string `json:"fullName"`
			Gender               string `json:"gender"`
			ProfilePicture       string `json:"profilePicture"`
			InternalEmailAddress string `json:"internalEmailAddress"`
		} `json:"user"`
		Pool   interface{} `json:"pool"`
		Status string      `json:"status"`
	} `json:"payload"`
}
type LegoUnregisterAction struct {
	Meta struct {
		EventID        int         `json:"eventId"`
		ActivationTime time.Time   `json:"activationTime"`
		FromPool       interface{} `json:"fromPool"`
	} `json:"meta"`
	Payload struct {
		ID   int `json:"id"`
		User struct {
			ID                   int    `json:"id"`
			Username             string `json:"username"`
			FirstName            string `json:"firstName"`
			LastName             string `json:"lastName"`
			FullName             string `json:"fullName"`
			Gender               string `json:"gender"`
			ProfilePicture       string `json:"profilePicture"`
			InternalEmailAddress string `json:"internalEmailAddress"`
		} `json:"user"`
		Pool   interface{} `json:"pool"`
		Status string      `json:"status"`
	} `json:"payload"`
}

func main() {
	flag.Parse()

	if len(*wsUrl) == 0 {
		log.Fatal("Missing wsUrl")
	}
	if *eventId == 0 {
		log.Fatal("Missing eventId")
	}

	log.SetFlags(0)

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	u, _ := url.Parse(*wsUrl)
	jwt := u.Query()["jwt"][0]
	log.Printf("connecting to %s", u.String())

	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Fatal("dial:", err)
	}
	defer c.Close()

	done := make(chan struct{})

	go func() {
		defer close(done)
		for {
			_, message, err := c.ReadMessage()
			if err != nil {
				log.Println("read:", err)
				return
			}
			var abstractAction LegoAction
			err = json.Unmarshal(message, &abstractAction)
			if err != nil {
				log.Printf("Error decding msg: %q with err: %e\n", message, err)
				continue
			}
			switch abstractAction.Type {
			case "Event.SOCKET_REGISTRATION.SUCCESS":
				var action LegoRegisterAction
				_ = json.Unmarshal(message, &action)

				if action.Meta.EventID != *eventId {
					break
				}

				log.Printf("Registering user %q in VOTE\n", action.Payload.User.FullName)
				client := &http.Client{}

				legoGet, _ := http.NewRequest("GET", *legoUserEndpont+action.Payload.User.Username, nil)
				legoGet.Header.Add("Authorization", "JWT "+jwt)

				resp, err := client.Do(legoGet)
				if err != nil {
					log.Printf("Error when fetching lego user: %e\n", err)
					break
				}
				var voteFormData struct {
					Email string `json:"email"`
				}
				defer resp.Body.Close()
				respData, _ := ioutil.ReadAll(resp.Body)

				log.Printf("Got this from LEGO: %q\n", respData)
				err = json.Unmarshal(respData, &voteFormData)

				if err != nil {
					log.Printf("Error when fetching lego user: %e\n", err)
					break
				}

				out, _ := json.Marshal(voteFormData)
				log.Printf("Posting to VOTE: %q", string(out))
				req, _ := http.NewRequest("POST", *voteEndpoint, bytes.NewBuffer(out))
				req.Header.Add("CSRF-Token", *csrfToken)
				req.Header.Add("content-type", "application/json;charset=UTF-8")
				req.Header.Set("Cookie", *authCookieVote)

				resp, err = client.Do(req)

				defer resp.Body.Close()
				respData, _ = ioutil.ReadAll(resp.Body)
				if err != nil {
					log.Printf("Error when creating user: %e, got: %s\n", err, respData)
					break
				}
				log.Printf("Creating user returned: %s, %s\n", resp.Status, respData)

			case "Event.SOCKET_UNREGISTRATION.SUCCESS":
				var action LegoUnregisterAction
				_ = json.Unmarshal(message, &action)

				if action.Meta.EventID != *eventId {
					break
				}

				log.Printf("User %q unregistered from event %d\n", action.Payload.User.FullName, *eventId)

				// We don't care?

			}
		}
	}()

	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-done:
			return
		case t := <-ticker.C:
			// Keepalive by chatting a bit I guess
			err := c.WriteMessage(websocket.TextMessage, []byte(t.String()))
			if err != nil {
				log.Println("write:", err)
				return
			}
		case <-interrupt:
			log.Println("interrupt")

			err := c.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
			if err != nil {
				log.Println("write close:", err)
				return
			}
			select {
			case <-done:
			case <-time.After(time.Second):
			}
			return
		}
	}
}
