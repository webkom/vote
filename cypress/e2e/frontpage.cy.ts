describe('Frontpage', () => {
  it('can open the frontpage', () => {
    cy.visit('/');
    cy.title().should('eq', 'Abavote');
    cy.url().should('match', /.*\/auth\/login/);
  });
});

export {};
