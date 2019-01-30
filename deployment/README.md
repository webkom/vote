## Example deployment using docker-compose

This is an example of a deployment of `vote` using docker-compose.

## Start service

```bash
$ docker-compose up -d
```

## Stop the service, and delete all the data

```bash
$ docker-compose down
```

### Create an admin-user

```bash
# Replace <username> with the admin-username, and <card-key> with a random value (or the ID of a card)
$ docker-compose exec vote ./bin/users create-admin <username> <card-key>
# You will then be asked for a password for the admin user
```

### Open the web-interface

The vote-server is now running on `http://localhost:3000`, so visit that url and login using your admin account.

### Register new users

New users can be created in the `Registrer bruker`. New users can login on the same url.

### Exposing to the interwebz

The vote service can be exposed to the web using a reverse-proxy like nginx, caddy or traefik. The only port that needs forwarding is port `3000`. Using https is also a must! :100:

### Using the card-readers

To register new users, you have to use a version of `vote` wrapped inside of `electron`. The code can be found inside the `electron-app` path, or can be downloaded from the release page, https://github.com/webkom/vote/releases.

// TODO allow users to customise the path of the vote-instance. Currently defaults to https://vote.abakus.no

// TODO add k8s manifests
