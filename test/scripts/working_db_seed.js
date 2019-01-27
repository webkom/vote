const colonize = require('../colonize');
/*
const Election = require('../../app/models/election');
const Alternative = require('../../app/models/alternative');
const helpers = require('../../test/helpers');
//const server = require('../../server');
const createUsers = helpers.createUsers;
const clearCollections = helpers.clearCollections;
const dropDatabase = helpers.dropDatabase;
*/


const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/vote_test'

const colonization = colonize({
    mongoUrl: MONGO_URL,
    seedingPath: '../test/seeding',
    dropDatabase: true,
    connectionWhitelist: [
        MONGO_URL
    ]
});

colonization.seed().then((obj) => {
    console.log(JSON.stringify(obj));
    process.exit(0);
}, (err) => {
    console.log('Error while executing!');
    console.log(err);
    process.exit(1);
})

/*
async function test() {
    console.log('START!');
    const result = await colonization.seed();
    console.log(result);
    console.log('END!');
}

test();
*/

/*
beforeEach(() => {
  cy.log('beforeEach!!')
  colonization.seed().then((etest) => cy.log('wet', etest));
})

afterEach(() => {
    cy.log('afterEach!!')
    colonization.close().then(() => cy.log('Disconnected!'));
});
*/

/*
describe('Hooks', function() {
    before(() => {
        cy.log('before!!')
        //mongoose.connection.on('connected', () => server(callback));
    })

    after(() => {
        cy.log('after!!')
        //dropDatabase(callback).nodeify(callback);
    })

    beforeEach(() => {
        cy.log('beforeEach!!')
        cy.log(colonization);
        console.log(colonization);
        coloization.seed().then(() => cy.log('wet'));
        // const { refs, stash } = await colonization.seed()
    });

    afterEach(() => {
        cy.log('afterEach!!')
        //await colonization.close();
    });
});
*/
