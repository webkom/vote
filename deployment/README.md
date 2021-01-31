# Deployment

To deploy VOTE, any method supporting docker containers can be used. Updated docker images are
available on [dockerhub](https://hub.docker.com/r/abakus/vote). This image can be deployed with
configuration of environment variables as in the docker-compose example below. Make sure a redis and
MongoDB instance is available to the container as well.

## Example deployment using docker-compose

This is an example of a deployment of `vote` using docker-compose.

### Start service

```bash
$ docker-compose up -d
```

### Stop the service, and delete all the data

```bash
$ docker-compose down
```

### Create users

The vote-CLI allows you to create **admin**, **moderator** and **normal** users. All users are created using the `create-user` command. The command takes two command line arguments, **username** and **card-key**. Both need to be unique and **username** is required to be at least 5 characters.

```bash
# Replace <username> with the username, and <card-key> with a random value
$ docker-compose exec vote ./bin/users create-user <username> <card-key>

# You will then be promted to select the type of user you want to create
Usermode:
 [1] for User
 [2] for Moderator
 [3] for Admin
 Enter mode: <mode>

# You will then be asked for a password, and greeted with a succes message.
$ Created user <username>
```

> The vote-server is now running on `http://localhost:3000`, so visit that url and login using your account.

### Exposing to the interwebz

The vote service can be exposed to the web using a reverse-proxy like nginx, caddy or traefik. The only port that needs forwarding is port `3000`. Using https is also a must! :100:

## Registering users

There are three ways that can be used to generate users. The first two, the _input form_ and _QR generator_, require the
user to be present at the computer logged into as a moderator. The last option, _using email_, can
be used with a digital election where the users are not present at the election itself.

### Register new users using input form

New users can be created in the `Registrer bruker` tab by scanning a card and filling out the form.

### Register new users using QR generator

New users can be created in the `QR` tab. By scanning a card a new user is automatically created with a random username and password. The data is encoded into the QR-code, so when a user scans the code they are automatically logged in. They are also promoted to save the username and password on their phone, in case they get logged out or want to login using another device.

### Register users using email

New users can be created in the `generer bruker` tab. By inputting the user's email and a username
(this can be whatever, but it is here to validate uniqueness of users). The user will be sent an
email with login credentials.

> NOTE: this requires email to be set up!

To set up email, use **either** of the authentication methods to connect to SMTP listed in the main
README. Use `GOOGLE_AUTH` for a service account connected to a google cloud user, or `SMTP_URL` to
connect to any smtp server with a username and password.
