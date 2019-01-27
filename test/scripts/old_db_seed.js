const mongoose = require('mongoose');
// const seeder = require('mongoose-seed');
const path = require('path');
const colonize = require('colonize');
const Election = require('../app/models/election');
const Alternative = require('../app/models/alternative');
const Vote = require('../app/models/vote');
const User = require('../app/models/user');
const helpers = require('../test/helpers');
// const server = require('../server');
const createUsers = helpers.createUsers;
const clearCollections = helpers.clearCollections;
const dropDatabase = helpers.dropDatabase;

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/vote'


// Data array containing seed data - documents organized by Model
var electionData = [
    {
        'model': 'Election',
        'documents': [
            {
                'title': 'activeElection1',
                'description': 'active election 1',
                'active': true,
            }
        ]
    },
];


const userData = [
    {
        'model': 'User',
        'documents': [
            helpers.testUser
        ]
    },
    {
        'model': 'User',
        'documents': [
            helpers.adminUser
        ]
    }
];

const activeElectionData = {
    title: 'activeElection1',
    description: 'active election 1',
    active: true
};

const testAlternative = {
    description: 'test alternative'
};


const obj = {}


const colonization = colonize.initialize({
  MONGO_URL,
  seedingPath: path.resolve(__dirname, './test/seeding'),

  // Connection whitelist is important, it's a list of allowed connections (this is to double check we're not seeding / dropping a live database)
  connectionWhitelist: [
    MONGO_URL
  ]
})

before(async () => {
  const { refs, stash } = await colonization.seed()

  // Once you set them here, you can use these in your tests to refer to all the created data ;)
  global.stash = stash
  global.refs = refs
})

// Don't forget to call `close`
after(async () => {
  await colonization.close()
})





// Connect to MongoDB via Mongoose
    /*
seeder.connect(MONGO_URL, () => {
  // Load Mongoose models
  seeder.loadModels([
      '../app/models/election'
  ]);

  // Clear specified collections
    seeder.clearModels(['Election', 'Alternative', 'Vote', 'User'], () => {

    // Callback to populate DB once collections have been cleared
    seeder.populateModels(electionData, (test) => {
        obj.election = election;
        testAlternative.election = election;
        seeder.disconnect();
    });

  });
});
*/

/*
obj.election = election;
testAlternative.election = election;
obj.alternative = new Alternative(testAlternative);
return election.addAlternative(obj.alternative);
*/


/*
const hash = '$2a$10$qxTI.cWwa2kwcjx4SI9KAuV4KxuhtlGOk33L999UQf1rux.4PBz7y'; // 'password'
const testUser = (exports.testUser = {
  username: 'testuser',
  cardKey: '99TESTCARDKEY',
  hash
});

const adminUser = (exports.adminUser = {
  username: 'admin',
  admin: true,
  cardKey: '55TESTCARDKEY',
  hash
});
*/

/*
function saveElectionAsync(election) {
    return new Promise(function(resolve, reject) {
        new Election(election).save(function(err) {
            if (err)
                reject(err);
            else
                resolve();
        })
    });
}



(async () => {
  console.log('start')

  try {
      //const myPromiseResult = await clearCollections() // your personal
    const election = new Election(activeElectionData);
    console.log('hei err!')
    Promise.all([saveElectionAsync(election)]).then(function() {
      console.log(t)
      console.log('testzor')
       bookshelfConn.close(function () {
          console.log('Mongoose connection closed!');
        });
    });


    // you can write instead of `then` statement below

  } catch (err) {
    console.error(err.message);
  } finally {
    console.log('end');
  }
})()
*/



/*
const obj = {}

const test = clearCollections()
  .then(() => {
    console.log('hei no!')
    const election = new Election(activeElectionData);
    console.log('hei err!')
    const t = election.save();
      console.log(t);
      console.log('ohno')
      return t;
  }, (err) => {
      console.log('bigno!')
      console.log(err)

  })
    .then((election) => {
      console.log('wtffff')
      console.log('hei!')
    obj.election = election;
    testAlternative.election = election;
    obj.alternative = new Alternative(testAlternative);
    return election.addAlternative(obj.alternative);
  })
  .then(() => createUsers())
  .spread(function(user, adminUser) {
    obj.user = user;
    obj.adminUser = adminUser;
  })
    .then(() => console.log(JSON.stringify(obj)))
    .catch(e => {
        console.log('error!')
        console.log(e)
    })

console.log('DONE!')
*/
