describe('Admin', () => {
  it('is redirected to admin page', function () {
    cy.loginAsAdmin();
    cy.visit('/');
    cy.url().should('match', /admin.*/);
  });

  it('can create a normal election', function () {
    const normalElectionTitle = 'Normal avstemning';
    const normalElectionDescription = 'Normal beskrivelse';

    const normalElectionAlternative1 = 'Normal alternativ 1';
    const normalElectionAlternative2 = 'Normal alternativ 2';

    cy.loginAsAdmin();
    cy.visit('/');
    cy.url().should('match', /admin/);
    cy.waitForJs();

    cy.contains('Lag avstemning').click();

    cy.get('button#submit').should('be.disabled');

    cy.get('input#title').type(normalElectionTitle);
    cy.get('input#description').type(normalElectionDescription);

    cy.getByExtendedSel('alternatives', '> div').then(($div) => {
      expect($div).to.have.length(1);
      cy.wrap($div.get(0)).type(normalElectionAlternative1);
    });

    cy.get('button#submit').should('not.be.disabled');

    cy.get('span.new-alternative').click();

    cy.getByExtendedSel('alternatives', '> div').then(($div) => {
      expect($div).to.have.length(2);
      cy.wrap($div.get(1)).type(normalElectionAlternative2);
    });
    cy.get('button#submit').should('not.be.disabled').click();

    cy.contains('Avstemning laget!');

    cy.url().should('match', /admin.*edit/);
    cy.contains('VANLIG VALG');
    cy.contains('FYSISK');
    cy.contains('ALMINNELIG FLERTALL');

    cy.contains(normalElectionTitle);
    cy.contains(normalElectionDescription);
    cy.contains(normalElectionAlternative1);
    cy.contains(normalElectionAlternative2);
  });

  it('can create a digital stv election and copy it', function () {
    const STVElectionTitle = 'STV avstemning';
    const STVElectionDescription = 'STV beskrivelse';

    const STVElectionAlternative1 = 'STV alternativ 1';
    const STVElectionAlternative2 = 'STV alternativ 2';

    cy.loginAsAdmin();
    cy.visit('/');
    cy.url().should('match', /admin/);
    cy.waitForJs();

    cy.contains('Lag avstemning').click();

    cy.get('button#submit').should('be.disabled');

    cy.get('input#title').type(STVElectionTitle);
    cy.get('input#description').type(STVElectionDescription);

    cy.getByExtendedSel('alternatives', '> div').then(($div) => {
      expect($div).to.have.length(1);
      cy.wrap($div.get(0)).type(STVElectionAlternative1);
    });

    cy.getBySel('stv-system-button').click();
    cy.getBySel('digital-election-button').click();
    cy.getBySel('qualified-majority').click();

    cy.get('button#submit').should('not.be.disabled');

    cy.get('span.new-alternative').click();

    cy.getByExtendedSel('alternatives', '> div').then(($div) => {
      expect($div).to.have.length(2);
      cy.wrap($div.get(1)).type(STVElectionAlternative2);
    });
    cy.get('button#submit').should('not.be.disabled').click();

    cy.contains('Avstemning laget!');

    cy.url().should('match', /admin.*edit/);
    cy.contains('PREFERANSEVALG');
    cy.contains('DIGITALT');
    cy.contains('KVALIFISERT FLERTALL');

    cy.contains(STVElectionTitle);
    cy.contains(STVElectionDescription);
    cy.contains(STVElectionAlternative1);
    cy.contains(STVElectionAlternative2);

    cy.contains('Kopier avstemning').click();

    cy.url().should('match', /create_election/);

    cy.get('input#title').should('have.value', STVElectionTitle);
    cy.get('input#description').should('have.value', STVElectionDescription);

    cy.getByExtendedSel('alternatives', '> div > div > input').then(($div) => {
      expect($div).to.have.length(2);
      cy.wrap($div.get(0)).should('have.value', STVElectionAlternative1);
      cy.wrap($div.get(1)).should('have.value', STVElectionAlternative2);
    });

    cy.getBySel('digital-election-button').get('input').should('be.checked');
    cy.getBySel('stv-system-button').get('input').should('be.checked');
    cy.getBySel('qualified-majority').should('be.checked');
  });

  it('can edit an existing election', function () {
    cy.loginAsAdmin();
    cy.visit('/');
    cy.url().should('match', /admin/);
    cy.waitForJs();

    cy.getByExtendedSel('elections', '> li').then(($li) => {
      expect($li).to.have.length(3);

      cy.wrap($li.get(0)).contains(/Aktiv/).click();
    });

    cy.contains('Deaktiver').click();
    cy.contains('Avstemning er deaktivert!');

    cy.contains('Avstemninger').click();

    cy.getByExtendedSel('elections', '> li').then(($li) => {
      expect($li).to.have.length(3);
      cy.wrap($li.get(0)).contains('Ikke Aktiv');
      cy.wrap($li.get(2)).contains('Ikke Aktiv').click();
    });

    cy.contains('Aktiver').click();
    cy.contains('Avstemning er aktivert');
  });

  it('marks election as unresolved with no votes', function () {
    cy.loginAsAdmin();
    cy.visit('/moderator');
    cy.url().should('match', /moderator/);
    cy.waitForJs();

    cy.getBySel('dummyReader').click();
    cy.url().should('not.match', /moderator\/serial_error/);

    cy.contains('Registrer bruker').click();
    cy.url().should('match', /moderator\/create_user/);

    cy.window().should('have.property', 'scanCard');
    cy.window().then((window) => window.scanCard(this.testUser.cardKey));

    cy.visit('/admin');
    cy.url().should('match', /admin/);

    cy.getByExtendedSel('elections', '> li').first().click();
    cy.contains('0/1');

    cy.contains('Deaktiver').click();

    cy.contains('Kalkuler resultat').click();

    cy.contains('UNRESOLVED');
  });

  it('marks election as resolved with sufficient votes', function () {
    cy.loginAsAdmin();
    cy.visit('/moderator');
    cy.url().should('match', /moderator/);
    cy.waitForJs();

    cy.getBySel('dummyReader').click();
    cy.url().should('not.match', /moderator\/serial_error/);

    cy.contains('Registrer bruker').click();
    cy.url().should('match', /moderator\/create_user/);

    cy.window().should('have.property', 'scanCard');
    cy.window().then((window) => window.scanCard(this.testUser.cardKey));

    cy.loginAsUser();
    cy.visit('/');
    cy.contains(this.normalAlternatives[0].description).click();
    cy.contains('Avgi stemme').click();
    cy.contains(/^Bekreft$/).click();
    cy.contains('Takk for din stemme!');

    cy.loginAsAdmin();
    cy.visit('/admin');
    cy.url().should('match', /admin/);

    cy.getByExtendedSel('elections', '> li').first().click();
    cy.contains('1/1');

    cy.contains('Deaktiver').click();

    cy.contains('Kalkuler resultat').click();

    cy.contains('RESOLVED');
  });

  it('marks election as unresolved with blank votes', function () {
    cy.loginAsAdmin();
    cy.visit('/moderator');
    cy.url().should('match', /moderator/);
    cy.waitForJs();

    cy.getBySel('dummyReader').click();
    cy.url().should('not.match', /moderator\/serial_error/);

    cy.contains('Registrer bruker').click();
    cy.url().should('match', /moderator\/create_user/);

    cy.window().should('have.property', 'scanCard');
    cy.window().then((window) => window.scanCard(this.testUser.cardKey));

    cy.loginAsUser();
    cy.visit('/');
    cy.contains('Stem blank').click();
    cy.contains(/^Bekreft$/).click();
    cy.contains('Takk for din stemme!');

    cy.loginAsAdmin();
    cy.visit('/admin');
    cy.url().should('match', /admin/);

    cy.getByExtendedSel('elections', '> li').first().click();
    cy.contains('1/1');

    cy.contains('Deaktiver').click();

    cy.contains('Kalkuler resultat').click();

    cy.contains('UNRESOLVED');
  });
});

export {};
