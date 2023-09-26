describe('Election', () => {
  it('Should be able to manipulate, vote, and confirm vote on stv election', function () {
    cy.loginAsUser();
    cy.visit('/');

    // First selected alternative changes submission text
    cy.contains('Stem blank');
    cy.contains(this.stvAlternatives[0].description).click();
    cy.contains('Avgi stemme');

    // Selecting more alternatives increases length of priorities
    cy.contains(this.stvAlternatives[1].description).click();
    cy.getByExtendedSel('priorities', '> li').then(($li) => {
      expect($li).to.have.length(2);
    });

    // Removing alternative also affect priority length
    cy.contains(this.stvAlternatives[1].description)
      .parents('li')
      .find('[data-testid="remove"]')
      .click();

    cy.getByExtendedSel('priorities', '> li').then(($li) => {
      expect($li).to.have.length(1);
    });

    // Should be able to manipulate order
    cy.contains(this.stvAlternatives[2].description).click();
    cy.ensurePriorityOrder([this.stvAlternatives[0], this.stvAlternatives[2]]);

    cy.getBySel('drag').eq(0).as('to');
    cy.getBySel('drag').eq(1).as('from');

    cy.get('@from').drag('@to');

    cy.ensurePriorityOrder([this.stvAlternatives[2], this.stvAlternatives[0]]);

    // Cancelling vote should not reset priority
    cy.contains('Avgi stemme').click();
    cy.contains('Avbryt').click();
    cy.ensurePriorityOrder([this.stvAlternatives[2], this.stvAlternatives[0]]);

    cy.contains('Avgi stemme').click();
    cy.ensureConfirmationOrder([
      this.stvAlternatives[2],
      this.stvAlternatives[0],
    ]);

    cy.contains(/^Bekreft$/).click();
    cy.contains('Takk for din stemme!');

    // Validate vote
    cy.contains('Valider stemme').click();
    cy.contains('Hent avstemning').click();

    cy.ensureConfirmationOrder([
      this.stvAlternatives[2],
      this.stvAlternatives[0],
    ]);
  });

  it('Should be able to manipulate, vote, and confirm vote on normal election', function () {
    cy.task('setNormalElection');
    cy.loginAsUser();
    cy.visit('/');

    // First selected alternative changes submission text
    cy.contains('Stem blank');
    cy.contains(this.stvAlternatives[0].description).click();
    cy.contains('Avgi stemme');

    // Selecting another alternative updates state
    cy.get('div.selected').should(($div) => {
      expect($div).to.have.length(1);
      expect($div).to.have.text(this.normalAlternatives[0].description);
    });

    cy.contains(this.stvAlternatives[1].description).click();

    // Removing alternative is also possible
    cy.contains(this.stvAlternatives[1].description).click();

    cy.get('div.selected').should(($div) => {
      expect($div).to.have.length(0);
    });
    cy.contains('Stem blank');

    // Cancelling vote should not reset choice
    cy.contains(this.stvAlternatives[2].description).click();
    cy.contains('Avgi stemme').click();
    cy.contains('Avbryt').click();
    cy.get('div.selected').should(($div) => {
      expect($div).to.have.length(1);
      expect($div).to.have.text(this.normalAlternatives[2].description);
    });

    cy.contains('Avgi stemme').click();
    cy.ensureConfirmationOrder([this.stvAlternatives[2]]);

    cy.contains(/^Bekreft$/).click();
    cy.contains('Takk for din stemme!');

    // Validate vote
    cy.contains('Valider stemme').click();
    cy.contains('Hent avstemning').click();

    cy.ensureConfirmationOrder([this.stvAlternatives[2]]);
  });

  it('Should be able to vote blank', function () {
    cy.task('setBlankElection');
    cy.loginAsUser();
    cy.visit('/');

    // Vote blank
    cy.contains('Stem blank').click();
    cy.contains('Blank stemme');

    cy.contains(/^Bekreft$/).click();
    cy.contains('Takk for din stemme!');

    // Validate vote
    cy.contains('Valider stemme').click();
    cy.contains('Hent avstemning').click();
    cy.contains('Blank stemme');
  });
});

export {};
