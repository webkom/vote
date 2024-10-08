# vote [![DroneCI](https://ci.webkom.dev/api/badges/webkom/vote/status.svg?branch=master)](https://ci.webkom.dev/webkom/vote) [![Coverage Status](https://coveralls.io/repos/github/webkom/vote/badge.svg?branch=master)](https://coveralls.io/github/webkom/vote?branch=master) [![Libraries.io dependency status for GitHub repo](https://img.shields.io/librariesio/github/webkom/vote)](https://libraries.io/github/webkom/vote#dependencies) ![GitHub](https://img.shields.io/github/license/webkom/vote)

> Digital voting system for Abakus' general assembly

![vote](https://i.imgur.com/DIMAJfj.png)

## Setup

vote assumes you have a MongoDB-server running on `mongodb://localhost:27017/vote` and a redis-server running as `localhost:6379`. To change the URL, export `MONGO_URL` and `REDIS_URL` as an environment variable.

```bash
# Start MongoDB and Redis, both required for development and production
$ docker-compose up -d
# Install all dependencies
$ yarn
$ yarn dev # terminal 1, backend and old frontend
$ yarn dev:client # terminal 2, new frontend
```

## Usage

The following docs outline the technical usage, if you've got someone else to set it up for you and are looking for how to interact with the GUI, check out [HOWTO.md](./HOWTO.md) (in norwegian).

### Users

Initially you will need to create a moderator and or admin user in order to login

```bash
# Create a user via the CLI. You are prompted to select usertype.
$ ./bin/users create-user <username> <cardKey>
```

### Card-readers

vote uses a RFID-reader to register and activate/deactivate users. This is done to make sure that only people that are at the location can vote. The RFID-reader needs to be connected to the computer that is logged in to the moderator panel. See section about using the card reader further down this readme.

### Development

> Check docs for the environment variable `ETHEREAL` if you intend to develop email related features

```bash
$ yarn start
```

### Environment variables

- `MONGO_URL`
  - Url to the database connection
  - `default`: `mongodb://0.0.0.0:27017/vote`
- `REDIS_URL`
  - Hostname of the redis server
  - `default`: `localhost`
- `ICON_SRC` _(optional)_
  - Url to the main icon on all pages
  - `default`: `/static/images/Abakule.jpg`
- `COOKIE_SECRET`
  - **IMPORTANT** to change this to a secret value in production!!
  - `default`: in dev: `localsecret`, otherwise empty
- `FRONTEND_URL`
  - The site where vote should run
  - `defualt`: `http://localhost:3000`
- `FROM`
  - The name we send mail from
  - `default`: `Abakus`
- `FROM_MAIL`
  - The email we send mail from
  - `default`: `admin@abakus.no`
- `SMTP_URL`
  - An SMTP connection string of the form `smtps://username:password@smtp.example.com/?pool=true`
- `GOOGLE_AUTH`
  - A base64 encoded string with the json data of a service account that can send mail.
- `NODE_ENV`
  - Node environment. `development`, `test` or `production`

See `app.js` and `env.js` for the rest

### Production

> For a production deployment example, see [deployment](./deployment/README.md) in the `deployment` folder

```bash
$ yarn build
$ ICON_SRC=https://some-domain/image.png NODE_ENV=production GOOGLE_AUTH=base64encoding yarn start
```

## Using the card-readers

Make sure you have enabled Experimental Web Platform features and are using Google Chrome. Experimental features can be enabled by navigating to: **chrome://flags/#enable-experimental-web-platform-features**.
Please check that the USB card reader is connected. When prompted for permissions, please select the card reader (CP210x).

### Serial permissions (Linux)

When using the card readers on a linux based system there can be permission problems with **google-chrome**. Chrome needs access to the ports, and often the ports are controlled by another group, so chrome cannot use them. Therefore you must do one of the following:

1. Run google-chrome as `root`

> NOTE: This has stopped working on modern versions of ubuntu-based distros, most likely due to the
> use of flatpak.

```sh
$ sudo google-chrome
```

**OR**

2. Add your user to the `dialout` group.
   - Check what group the tty(USBPORT) is:
   ```
   $ ls -al /dev/ttyUSB* | cut -d ' ' -f 2`
   ```
   - Check what groups your user is added to:
   ```sh
   $ groups
   ```
   - Normally the `tty` is in the `dialout` group, so add your user to that group with:
   ```sh
   $ sudo usrmod -a -G dialout $USER
   ```

> You need to sign in and out to get the new privileges!

## Tests

vote uses vitest for backend cypress for the frontent tests. To run them all you can do:

```bash
# Frontend (headless) and backend
$ yarn test
# Frontend with gui
$ yarn test:frontend
```

## Vote Occasion

We have a list of every occasion vote has been used. If you or your organization use vote for your event we would love if you made a PR where you append your event to the list.

The list is located at `./usage.yml`. Just create a new entry at the bottom. Then run `yarn lint` to see if your YAML is correct.

---

MIT © webkom, Abakus Linjeforening
