const mongoose = require('mongoose');
const Election = require('../../app/models/election');
const Alternative = require('../../app/models/alternative');
const helpers = require('../../test/helpers');
//const server = require('../../server');
const createUsers = helpers.createUsers;
const clearCollections = helpers.clearCollections;
const dropDatabase = helpers.dropDatabase;

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/vote_test'

const activeElectionData = {
    title: 'activeElection1',
    description: 'active election 1',
    active: true
};

const testAlternative = {
    description: 'test alternative'
};

const obj = {};

mongoose.connect(MONGO_URL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    clearCollections()
        .then(() => {
            const election = new Election(activeElectionData);
            return election.save();
        })
        .then(election => {
            obj.election = election;
            testAlternative.election = election;
            const alternative = new Alternative(testAlternative);
            obj.alternative = alternative;
            return election.addAlternative(alternative);
        })
        .then(() => createUsers())
        .spread((user, adminUser) => {
            obj.user = user;
            obj.admin = adminUser
            console.log(JSON.stringify(obj));
            process.exit(0);
        })
});
