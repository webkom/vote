const mongoose = require('mongoose');
const helpers = require('../../test/helpers');
const dropDatabase = helpers.dropDatabase;

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/vote_test'

mongoose.connect(MONGO_URL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    dropDatabase().then(() => {
        console.log(JSON.stringify({
            status: 'OK'
        }));
        process.exit(0);
    })
});
