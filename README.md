# vote [![CircleCI](https://circleci.com/gh/webkom/vote.svg?style=shield)](https://circleci.com/gh/webkom/vote) [![Coverage Status](https://coveralls.io/repos/github/webkom/vote/badge.svg?branch=master)](https://coveralls.io/github/webkom/vote?branch=master)

> vote optimizes the election

Digital voting system for Abakus' general assembly, built using the MEAN-stack (mongoDB, Express, AngularJS, Node.js).
Relevant (Norwegian) blog post: http://webkom.abakus.no/vote/

![vote](http://i.imgur.com/DU1CXQx.png)

## Setup

vote assumes you have a MongoDB-server running on `mongodb://localhost:27017/vote`. To change the URL, export `MONGO_URL` as an environment variable.

```bash
$ git clone git@github.com:webkom/vote.git
$ cd vote

# Start MongoDB-server
$ docker-compose up -d

$ yarn

# Create a user via the CLI. You are promted to select usertype.
$ ./bin/users create-user <username> <cardKey>
```

## Usage

vote uses a RFID-reader to register and activate/deactivate users. This is done to make sure that only people that are at the location can vote. To access the RFID-reader vote is also packed as a Electron-app, in the `./electron-app`-folder.

A binary version of the electron app can be found in [releases](https://github.com/webkom/vote/releases). Docker images can be found on dockerhub: [abakus/vote](https://hub.docker.com/r/abakus/vote).

An example deployment can be found in the `./deployment` folder.

### Development

```bash
$ yarn start
```

### Environment variables

- `LOGO_SRC` _(optional)_
  - Url to the main logo on all pages
  - `default`: `/static/images/Abakule.jpg`

### Production

```bash
$ yarn build
$ LOGO_SRC=https://my-domain.tld/logo.png NODE_ENV=production yarn start
```

## Tests

vote uses mocha for the backend tests and cucumber.js/protractor for the frontend tests. To run them all you can do:

```bash
$ yarn test
# To run in headless mode:
$ HEADLESS=true yarn test
```

## Vote occasion

We have a list of every occasion vote has been used. If you or your organization use vote for your event we would love if you made a PR where you append your event to the list.

The list is located at `./usage.yml`. Just create a new entry at the bottom.

---

MIT © webkom, Abakus Linjeforening
