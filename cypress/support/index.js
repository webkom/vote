/*
const Election = require('../../app/models/election');
const Alternative = require('../../app/models/alternative');
const User = require('../../app/models/user');
*/

beforeEach(() => {
    cy.exec('npm run --silent db:seed', { timeout: 2000 }).its('stdout').then(result => {
        const data = JSON.parse(result)
        // Cast to Election, Alternative, models. etc.
        // How to save with Cypress? exec?
        cy.wrap(data.election).as('election');
        cy.wrap(data.alternative).as('alternative');
        cy.wrap(data.user).as('testUser');
        cy.wrap(data.admin).as('adminUser');
        /*
         *
        cy.wrap(Election(data.election)).as('election');
        cy.wrap(Alternative(data.alternative)).as('alternative');
        cy.wrap(User(data.user)).as('testUser');
        cy.wrap(User(data.admin)).as('adminUser');
        */
    })
});

afterEach(() => cy.exec('npm run --silent db:reset', { timeout: 2000 }).its('stdout'));

