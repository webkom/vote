# Daemon to sync from LEGO to VOTE

This use a websocket connection from LEGO and create new VOTE users when a user registers on an event.

```
Usage of ./sync:
  -csrf-token string
        A csrf token from VOTE. Look in a request. On the format: "RaNdom-String"
  -event int
        Event id to make users from. On the format: 123
  -lego-user-endpoint string
        Endpoint to users on LEGO. On the format: "https://lego-domain.no/api/v1/users/"
  -socket-url string
        Websocket url, full url w/token. Look in console on abakus.no. On the format: "wss://ws.abakus-domain.no/?jwt=long-jwt-here"
  -vote-cookie string
        Vote session cookie. On the format: "connect.sid=xasda"
  -vote-endpoint string
        Endpoint to VOTE generate. On the format: "https://vote.abakus-domain.no/api/user/generate"
```
