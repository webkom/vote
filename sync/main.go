package main

import (
	"encoding/json"
	"flag"
	"log"
	"net/url"
	"os"
	"os/signal"
	"time"

	"github.com/gorilla/websocket"
)

var eventId = flag.Int("event", 0, "Event it to make users from")
var wsUrl = flag.String("socket-url", "no", "Websocket url, full url w/token (look in console on abakus.no)")

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

				// Fetch email from LEGO

				// Fetch VOTE API

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
