/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
//
import '@4tw/cypress-drag-drop';

// Type definitions in cypress.d.ts

Cypress.Commands.add('getBySel', function (selector, ...args) {
  return cy.get(`[data-testid=${selector}]`, ...args);
});

Cypress.Commands.add(
  'getByExtendedSel',
  function (selector, extension, ...args) {
    return cy.get(`[data-testid=${selector}] ${extension}`, ...args);
  }
);

Cypress.Commands.add('waitForJs', function () {
  // cy.window().its('Cypress').should('be.an', 'object');
  // cy.window().should('have.property', 'Ready', true);
  cy.wait(1900);
});

Cypress.Commands.add('login', function (username, password) {
  cy.session(
    username,
    () => {
      cy.visit('/');

      if (Cypress.env('NODE_ENV') === 'development') {
        cy.intercept('*/auth/token').as('token'); // Avoid undefined behavior during dev
        cy.wait('@token');
      }
      cy.waitForJs();
      cy.get('input#username').type(username);
      cy.get('input#password').type(password);
      cy.get('button[type=submit]').click();
      cy.url().should('not.match', /.*\/auth\/login/);
    },
    {
      validate: () => {
        cy.visit('/');
        cy.waitForJs();
        cy.getCookie('connect.sid').should('exist');
        cy.url().should('not.match', /.*\/auth\/login/);
      },
    }
  );
});

Cypress.Commands.add('loginAsUser', function () {
  cy.login(this.testUser.username, 'password');
});

Cypress.Commands.add('loginAsModerator', function () {
  cy.login(this.moderatorUser.username, 'password');
});

Cypress.Commands.add('loginAsAdmin', function () {
  cy.login(this.adminUser.username, 'password');
});

Cypress.Commands.add('ensurePriorityOrder', function (alternatives) {
  cy.getByExtendedSel('priorities', '> li').then(($li) => {
    expect($li).to.have.length(alternatives.length);

    for (let i = 0; i < alternatives.length; i++) {
      expect($li.eq(i))
        .to.contain.text(alternatives[i].description)
        .and.contain.text((i + 1).toString());
    }
  });
});

Cypress.Commands.add('ensureConfirmationOrder', function (alternatives) {
  cy.getByExtendedSel('confirmation', '> li').then(($li) => {
    expect($li).to.have.length(alternatives.length);

    for (let i = 0; i < alternatives.length; i++) {
      expect($li.eq(i)).to.contain.text(alternatives[i].description);
    }
  });
});
