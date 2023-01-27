# Daemon to sync from LEGO to VOTE

This use a websocket connection from LEGO and create new VOTE users when a user registers on an event.

You can also run with `-init` to run a complete sync of all users registered to the event. Just put
a dummy value for the `-socket-url` in this instance.

```
Usage of ./sync:
  -csrf-token string
        A csrf token from VOTE. Look in a request. On the format: "RaNdom-String"
  -event int
        Event id to make users from. On the format: 123
  -init
        Run a complete sync. Will get all emails from registration and register to vote
  -lego-endpoint string
        Endpoint to api on LEGO. On the format: "https://lego-domain.no/api/v1/"
  -lego-token string
        Lego bearer token here. Look in the header of a request to lego api.
  -socket-url string
        Websocket url, full url w/token. Look in console on abakus.no. On the format: "wss://ws.abakus-domain.no/?jwt=long-bearer-here"
  -vote-cookie string
        Vote session cookie. On the format: "connect.sid=xasda"
  -vote-endpoint string
        Endpoint to VOTE generate. On the format: "https://vote.abakus-domain.no/api/user/generate"
```
