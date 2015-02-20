# vote [![Build status](https://ci.frigg.io/badges/webkom/vote/)](https://ci.frigg.io/webkom/vote/last/) [![Coverage status](https://ci.frigg.io/badges/coverage/webkom/vote/)](https://ci.frigg.io/webkom/vote/last/)
> vote optimizes the election

Digital voting system for Abakus' general assembly, built using the MEAN-stack (mongoDB, Express, AngularJS, Node.js).

## Setup

vote assumes you have a MongoDB-server running on `mongodb://localhost:27017/vote`. To change the URL, export `MONGO_URL` as an environment variable.

```bash
$ git clone git@github.com:webkom/vote.git
$ cd vote
$ make install
$ ./bin/users create-admin <username> <cardKey>
```

## Usage

vote uses a RFID-reader to register and activate/deactivate users. This is done to make sure that only people that are at the location can vote. To access the RFID-reader vote is also packed as a Chrome-app, in the `./chrome-app`-folder.

```bash
$ npm start
```

## Tests

vote uses mocha for the backend tests and cucumber.js/protractor for the frontend tests. To run them all you can do:
```bash
$ make test
```

 --------
  MIT © webkom, Abakus Linjeforening
