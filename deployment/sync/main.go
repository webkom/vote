package main

import (
	"bytes"
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"time"

	"github.com/gorilla/websocket"
)

var eventId = flag.Int("event", 0, "Event id to make users from. On the format: 123")
var wsUrl = flag.String("socket-url", "", `Websocket url, full url w/token. Look in console on abakus.no. On the format: "wss://ws.abakus-domain.no/?jwt=long-jwt-here"`)
var authCookieVote = flag.String("vote-cookie", "", `Vote session cookie. On the format: "connect.sid=xasda"`)
var csrfToken = flag.String("csrf-token", "", `A csrf token from VOTE. Look in a request. On the format: "RaNdom-String" `)
var voteEndpoint = flag.String("vote-endpoint", "", `Endpoint to VOTE generate. On the format: "https://vote.abakus-domain.no/api/user/generate"`)
var legoUserEndpont = flag.String("lego-user-endpoint", "", `Endpoint to users on LEGO. On the format: "https://lego-domain.no/api/v1/users/"`)

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
	if len(os.Args) == 1 {
		flag.Usage()
		os.Exit(2)
	}

	if len(*wsUrl) == 0 {
		log.Fatal("Missing wsUrl")
	}
	if *eventId == 0 {
		log.Fatal("Missing eventId")
	}
	if len(*authCookieVote) == 0 {
		log.Fatal("Missing authCookieVote")
	}
	if len(*csrfToken) == 0 {
		log.Fatal("Missing csrfToken")
	}
	if len(*voteEndpoint) == 0 {
		log.Fatal("Missing authCookieVote")
	}
	if len(*legoUserEndpont) == 0 {
		log.Fatal("Missing legoUserEndpoint")
	}

	log.SetFlags(0)

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	u, _ := url.Parse(*wsUrl)
	jwt := u.Query()["jwt"][0]

	for {
		err := runLegoToVoteSync(interrupt, u, jwt)

		// Exit if runLegoToVoteSync returns nil, otherwise reconnect
		if err == nil {
			break
		}
		log.Printf("connection error, will reconnect: %e\n", err)
		time.Sleep(2 * time.Second)
	}

}
func runLegoToVoteSync(interrupt chan os.Signal, url *url.URL, jwt string) error {
	log.Printf("connecting to %s", url.String())

	c, _, err := websocket.DefaultDialer.Dial(url.String(), nil)
	if err != nil {
		return fmt.Errorf("dial: %e", err)
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
				log.Printf("Error decoding msg: %q with err: %e\n", message, err)
				continue
			}
			switch abstractAction.Type {
			case "Event.SOCKET_REGISTRATION.SUCCESS":
				var action LegoRegisterAction
				err = json.Unmarshal(message, &action)

				if err != nil {
					log.Printf("Error when decoding action: %e\n", err)
					break
				}

				if action.Meta.EventID != *eventId {
					break
				}

				log.Printf("Registering user %q in VOTE\n", action.Payload.User.FullName)
				client := &http.Client{}

				ctx, cnl := context.WithTimeout(context.Background(), 30*time.Second)
				defer cnl()

				legoGet, err := http.NewRequestWithContext(ctx, "GET", *legoUserEndpont+action.Payload.User.Username, nil)
				if err != nil {
					log.Printf("Error when creating lego user req: %e\n", err)
					break
				}
				legoGet.Header.Add("Authorization", "JWT "+jwt)

				resp, err := client.Do(legoGet)
				if err != nil {
					log.Printf("Error when fetching lego user: %e\n", err)
					break
				}
				var legoUserData struct {
					Email string `json:"email"`
				}
				defer resp.Body.Close()
				respData, err := ioutil.ReadAll(resp.Body)
				if err != nil {
					log.Printf("Error when reading lego user: %e\n", err)
					break
				}

				err = json.Unmarshal(respData, &legoUserData)

				if err != nil {
					log.Printf("Error when unmarshalling user: %e\n", err)
					break
				}

				voteFormData := struct {
					Email      string `json:"email"`
					Identifier string `json:"identifier"`
				}{
					Email:      legoUserData.Email,
					Identifier: action.Payload.User.Username,
				}

				out, err := json.Marshal(voteFormData)
				if err != nil {
					log.Printf("Error when marshalling user: %e\n", err)
					break
				}

				log.Printf("Posting to VOTE: %q", string(out))
				req, err := http.NewRequest("POST", *voteEndpoint, bytes.NewBuffer(out))
				if err != nil {
					log.Printf("Error when creating VOTE req: %e\n", err)
					break
				}
				req.Header.Add("CSRF-Token", *csrfToken)
				req.Header.Add("content-type", "application/json;charset=UTF-8")
				req.Header.Set("Cookie", *authCookieVote)

				resp, err = client.Do(req)
				if err != nil {
					log.Printf("Error when fetching VOTE: %e\n", err)
					break
				}

				defer resp.Body.Close()
				respData, err = ioutil.ReadAll(resp.Body)
				if err != nil {
					log.Printf("Error when reading from vote: %e\n", err)
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
			return fmt.Errorf("unexpected disconnect")
		case t := <-ticker.C:
			// Keepalive by chatting a bit I guess
			err := c.WriteMessage(websocket.TextMessage, []byte(t.String()))
			if err != nil {
				log.Println("write:", err)
				return err
			}
		case <-interrupt:
			log.Println("interrupt")

			err := c.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
			if err != nil {
				log.Println("write close:", err)
				return nil
			}
			select {
			case <-done:
			case <-time.After(time.Second):
			}
			return nil
		}
	}

}
