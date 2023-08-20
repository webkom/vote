// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import type {
  AlternativeType,
  IElection,
  UserType,
} from '../../app/types/types';
import './commands';

beforeEach(() => {
  cy.task('clearCollections');
  cy.task<UserType[]>('createUsers').then(
    ([testUser, adminUser, moderatorUser]) => {
      cy.wrap(testUser).as('testUser');
      cy.wrap(adminUser).as('adminUser');
      cy.wrap(moderatorUser).as('moderatorUser');
    }
  );

  cy.task<[IElection, IElection, IElection, AlternativeType, AlternativeType]>(
    'createElections'
  ).then(
    ([
      stvElection,
      normalElection,
      blankElection,
      stvAlternatives,
      normalAlternatives,
    ]) => {
      cy.wrap(stvElection).as('stvElection');
      cy.wrap(normalElection).as('normalElection');
      cy.wrap(blankElection).as('blankElection');
      cy.wrap(stvAlternatives).as('stvAlternatives');
      cy.wrap(normalAlternatives).as('normalAlternatives');
    }
  );
});

after(() => {
  cy.task('clearCollections');
});
