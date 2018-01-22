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
$ yarn
$ ./bin/users create-admin <username> <cardKey>
```

## Usage

vote uses a RFID-reader to register and activate/deactivate users. This is done to make sure that only people that are at the location can vote. To access the RFID-reader vote is also packed as a Chrome-app, in the `./chrome-app`-folder.

### Development
```bash
$ yarn start
```

### Production
```bash
$ yarn build
$ NODE_ENV=production yarn start
```

## Tests

vote uses mocha for the backend tests and cucumber.js/protractor for the frontend tests. To run them all you can do:
```bash
$ yarn test
```

 --------
  MIT © webkom, Abakus Linjeforening
