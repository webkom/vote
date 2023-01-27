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
	"strconv"
	"time"

	"github.com/gorilla/websocket"
)

var eventId = flag.Int("event", 0, "Event id to make users from. On the format: 123")
var wsUrl = flag.String("socket-url", "", `Websocket url, full url w/token. Look in console on abakus.no. On the format: "wss://ws.abakus-domain.no/?jwt=long-bearer-here"`)
var lego_token = flag.String("lego-token", "", "Lego bearer token here. Look in the header of a request to lego api.")
var authCookieVote = flag.String("vote-cookie", "", `Vote session cookie. On the format: "connect.sid=xasda"`)
var csrfToken = flag.String("csrf-token", "", `A csrf token from VOTE. Look in a request. On the format: "RaNdom-String" `)
var voteEndpoint = flag.String("vote-endpoint", "", `Endpoint to VOTE generate. On the format: "https://vote.abakus-domain.no/api/user/generate"`)
var legoEndpoint = flag.String("lego-endpoint", "", `Endpoint to api on LEGO. On the format: "https://lego-domain.no/api/v1/"`)
var initSync = flag.Bool("init", false, "Run a complete sync. Will get all emails from registration and register to vote")

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
		ID     int         `json:"id"`
		User   LegoUser    `json:"user"`
		Pool   interface{} `json:"pool"`
		Status string      `json:"status"`
	} `json:"payload"`
}

type LegoUser struct {
	ID                   int    `json:"id"`
	Username             string `json:"username"`
	FirstName            string `json:"firstName"`
	LastName             string `json:"lastName"`
	FullName             string `json:"fullName"`
	Gender               string `json:"gender"`
	ProfilePicture       string `json:"profilePicture"`
	InternalEmailAddress string `json:"internalEmailAddress"`
}

type LegoUnregisterAction struct {
	Meta struct {
		EventID        int         `json:"eventId"`
		ActivationTime time.Time   `json:"activationTime"`
		FromPool       interface{} `json:"fromPool"`
	} `json:"meta"`
	Payload struct {
		ID   int `json:"id"`
		User LegoUser
	} `json:"payload"`
}

type EventRegistration struct {
	ID     int      `json:"id"`
	User   LegoUser `json:"user"`
	Status string   `json:"status"`
}

type EventPool struct {
	ID            int                 `json:"id"`
	Registrations []EventRegistration `json:"registrations"`
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
	if len(*lego_token) == 0 {
		log.Fatal("Missing lego_token")
	}
	if len(*legoEndpoint) == 0 {
		log.Fatal("Missing legoEndpoint")
	}

	if *initSync {
		runOneSync()
		os.Exit(0)
	}

	log.SetFlags(0)

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	u, _ := url.Parse(*wsUrl)

	for {
		err := runLegoToVoteSync(interrupt, u)

		// Exit if runLegoToVoteSync returns nil, otherwise reconnect
		if err == nil {
			break
		}
		log.Printf("connection error, will reconnect: %e\n", err)
		time.Sleep(2 * time.Second)
	}

}

func getUserEmail(username string) (string, error) {

	client := &http.Client{}

	ctx, cnl := context.WithTimeout(context.Background(), 30*time.Second)
	defer cnl()

	legoGet, err := http.NewRequestWithContext(ctx, "GET", *legoEndpoint+"users/"+username, nil)
	if err != nil {
		log.Printf("Error when creating lego user req: %e\n", err)
		return "", err
	}
	legoGet.Header.Add("Authorization", "Bearer "+*lego_token)

	resp, err := client.Do(legoGet)
	if err != nil {
		log.Printf("Error when fetching lego user: %e\n", err)
		return "", err
	}
	var legoUserData struct {
		Email string `json:"email"`
	}
	defer resp.Body.Close()
	respData, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error when reading lego user: %e\n", err)
		return "", err
	}

	err = json.Unmarshal(respData, &legoUserData)

	if err != nil {
		log.Printf("Error when unmarshalling user: %e\n", err)
		return "", err
	}

	return legoUserData.Email, nil
}

func registerUserInVote(userEmail string, username string) error {

	client := &http.Client{}

	voteFormData := struct {
		Email      string `json:"email"`
		Identifier string `json:"identifier"`
	}{
		Email:      userEmail,
		Identifier: username,
	}

	out, err := json.Marshal(voteFormData)
	if err != nil {
		log.Printf("Error when marshalling user: %e\n", err)
		return err
	}

	log.Printf("Posting to VOTE: %q", string(out))
	req, err := http.NewRequest("POST", *voteEndpoint, bytes.NewBuffer(out))
	if err != nil {
		log.Printf("Error when creating VOTE req: %e\n", err)
		return err
	}
	req.Header.Add("CSRF-Token", *csrfToken)
	req.Header.Add("content-type", "application/json;charset=UTF-8")
	req.Header.Set("Cookie", *authCookieVote)

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error when fetching VOTE: %e\n", err)
		return err
	}

	defer resp.Body.Close()
	respData, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error when reading from vote: %e\n", err)
		return err
	}
	log.Printf("Creating user returned: %s, %s\n", resp.Status, respData)
	return nil
}

func runLegoToVoteSync(interrupt chan os.Signal, url *url.URL) error {
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

				userEmail, err := getUserEmail(action.Payload.User.Username)

				if err != nil {
					log.Printf("Error while retrieving user email: %e\n", err)
					break
				}

				err = registerUserInVote(userEmail, action.Payload.User.Username)

				if err != nil {
					log.Printf("Error while registering user in vote: %e\n", err)
					break
				}

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

func runOneSync() error {

	client := &http.Client{}

	ctx, cnl := context.WithTimeout(context.Background(), 30*time.Second)
	defer cnl()

	legoGet, err := http.NewRequestWithContext(ctx, "GET", *legoEndpoint+"events/"+strconv.Itoa(*eventId)+"/administrate", nil)
	if err != nil {
		log.Printf("Error when creating lego event req: %e\n", err)
		return err
	}
	legoGet.Header.Add("Authorization", "Bearer "+*lego_token)

	resp, err := client.Do(legoGet)
	if err != nil {
		log.Printf("Error when fetching lego user: %e\n", err)
		return err
	}

	var legoEventData struct {
		Pools []EventPool `json:"pools"`
	}

	defer resp.Body.Close()
	respData, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error when reading lego user: %e\n", err)
		return err
	}

	err = json.Unmarshal(respData, &legoEventData)

	if err != nil {
		log.Fatal("Error while unmarshalling event data")
	}

	for _, pool := range legoEventData.Pools {
		for _, reg := range pool.Registrations {
			if reg.Status == "SUCCESS_REGISTER" {
				userEmail, err := getUserEmail(reg.User.Username)

				if err != nil {
					log.Printf("Error while retrieving user email: %e\n", err)
					continue
				}

				log.Printf("user email to be registered: %s", userEmail)

				err = registerUserInVote(userEmail, reg.User.Username)

				if err != nil {
					log.Printf("Error while registering user in vote: %e\n", err)
					continue
				}
			}
		}
	}

	return nil
}
