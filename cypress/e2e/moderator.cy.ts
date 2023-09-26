describe('Moderator', () => {
  it('is redirected to moderator page', () => {
    cy.loginAsModerator();
    cy.visit('/');
    cy.url().should('match', /moderator.*/);
  });

  it('is able to register user with dummy reader', () => {
    cy.loginAsModerator();
    cy.visit('/');
    cy.url().should('match', /moderator\/serial_error/);

    cy.getBySel('dummyReader').click();
    cy.url().should('not.match', /moderator\/serial_error/);

    cy.contains('Registrer bruker').click();
    cy.url().should('match', /moderator\/create_user/);

    cy.window().should('have.property', 'scanCard');
    cy.window().then((window) => window.scanCard(123123));

    cy.get('input#username').type('nybruker');
    cy.get('input#password').type('nyttpassord');
    cy.get('input#confirmPassword').type('nyttpassord');

    cy.contains('Lag ny bruker').click();
    cy.contains('Bruker registrert!');

    cy.login('nybruker', 'nyttpassord');
    cy.visit('/');
    cy.waitForJs();
    cy.url().should('not.match', /.*auth\/login/);
  });

  it('is able to create email-user with dummy reader', () => {
    // https://www.cypress.io/blog/2021/05/11/testing-html-emails-using-cypress/
    const identifier = 'v3ry R4nDøm !d.';
    const receiver = 'standard.3mail@abakusetcetc.com';

    cy.loginAsModerator();
    cy.visit('/');
    cy.url().should('match', /moderator\/serial_error/);

    cy.getBySel('dummyReader').click();
    cy.url().should('not.match', /moderator\/serial_error/);

    cy.contains('Generer bruker').click();

    cy.get('input#identifier').type(identifier);
    cy.get('input#email').type(receiver);
    cy.waitForJs();
    cy.get('button#submit').click();
    cy.contains(`Bruker ${identifier} ble generated!`);

    cy.task<string>('getLatestEmail', receiver)
      .then(cy.wrap)
      .then((s: string) => {
        const [username, password] = [
          ...s.matchAll(/(Brukernavn|Passord): <\/b>(\w+)</gms),
        ].map((s) => s[2]);

        cy.login(username, password);
        cy.visit('/');
        cy.location('pathname').should('match', /^\/$/);

        // Delete created user
        cy.loginAsModerator();
        cy.visit('/');
        cy.url().should('match', /moderator\/serial_error/);

        cy.getBySel('dummyReader').click();
        cy.url().should('not.match', /moderator\/serial_error/);

        cy.contains('Register').click();
        cy.contains('Slett').should('be.disabled');

        cy.login(username, password);
      });
  });

  it('is able to create qr-user with dummy reader', () => {
    cy.loginAsModerator();
    cy.visit('/');
    cy.url().should('match', /moderator\/serial_error/);

    cy.getBySel('dummyReader').click();
    cy.url().should('not.match', /moderator\/serial_error/);

    cy.contains('QR').click();

    cy.window().should('have.property', 'scanCard');
    cy.window().then((window) => window.scanCard(123123));

    cy.url().should('match', /moderator\/showqr/);

    // Attempt to sign in with token
    cy.location('search').then((search) => {
      cy.session(search, () => {
        cy.visit(`/auth/login${search}`);
        cy.get('button[type=submit]').should('be.hidden');
        cy.contains('Jeg har tatt screenshot').click();
        cy.get('button[type=submit]').click();
        cy.location('pathname').should('match', /^\/$/);
      });
    });
  });

  it('can activate/deactivate users with dummy reader', function () {
    cy.loginAsModerator();
    cy.visit('/');
    cy.url().should('match', /moderator\/serial_error/);

    cy.getBySel('dummyReader').click();
    cy.url().should('not.match', /moderator\/serial_error/);

    cy.contains('Aktiver bruker').click();

    cy.window().should('have.property', 'scanCard');
    cy.window().then((window) => window.scanCard(this.testUser.cardKey));

    cy.contains('Kort deaktivert');

    cy.loginAsUser();
    cy.task('setNormalElection');
    cy.visit('/');
    cy.contains('Din bruker er ikke aktivert');

    cy.loginAsModerator();
    cy.visit('/');
    cy.url().should('match', /moderator\/serial_error/);

    cy.getBySel('dummyReader').click();
    cy.url().should('not.match', /moderator\/serial_error/);

    cy.contains('Aktiver bruker').click();

    cy.window().should('have.property', 'scanCard');
    cy.window().then((window) => window.scanCard(this.testUser.cardKey));

    cy.contains('Kort aktivert');

    cy.loginAsUser();
    cy.task('setNormalElection');
    cy.visit('/');
    cy.contains(this.normalElection.title);
  });

  it('can change card of user', function () {
    cy.loginAsModerator();
    cy.visit('/');
    cy.url().should('match', /moderator\/serial_error/);

    cy.getBySel('dummyReader').click();
    cy.url().should('not.match', /moderator\/serial_error/);

    cy.contains('Mistet kort').click();

    cy.window().should('have.property', 'scanCard');
    cy.window().then((window) => window.scanCard(this.testUser.cardKey + 1));

    cy.get('input#username').type(this.testUser.username);
    cy.get('input#password').type('password');

    cy.contains('Registrer nytt kort').click();

    cy.contains('Det nye kortet er nå registrert');
  });

  it('can deactivate users', function () {
    cy.loginAsModerator();
    cy.visit('/');
    cy.url().should('match', /moderator\/serial_error/);

    cy.getBySel('dummyReader').click();
    cy.url().should('not.match', /moderator\/serial_error/);

    cy.contains('Deaktiver brukere').click();
    cy.waitForJs();

    cy.getBySel('deactivate').click();
    cy.contains('Alle brukere ble deaktivert');

    cy.loginAsUser();
    cy.task('setNormalElection');
    cy.visit('/');
    cy.contains('Din bruker er ikke aktivert');
  });

  it('can delete email-user which has not been activated', function () {
    const identifier = 'Eslvnselijf';
    const receiver = 'never.activate@abakusetcetc.com';

    cy.loginAsModerator();
    cy.visit('/');
    cy.url().should('match', /moderator\/serial_error/);

    cy.getBySel('dummyReader').click();
    cy.url().should('not.match', /moderator\/serial_error/);

    cy.contains('Generer bruker').click();

    cy.get('input#identifier').type(identifier);
    cy.get('input#email').type(receiver);
    cy.waitForJs();
    cy.get('button#submit').click();
    cy.contains(`Bruker ${identifier} ble generated!`);

    cy.task<string>('getLatestEmail', receiver)
      .then(cy.wrap)
      .then((s: string) => {
        const [username, password] = [
          ...s.matchAll(/(Brukernavn|Passord): <\/b>(\w+)</gms),
        ].map((s) => s[2]);

        cy.contains('Register').click();
        cy.contains('Slett').click();

        cy.contains('Register and associated user deleted.');

        cy.session(username, () => {
          cy.visit('/');

          cy.get('input#username').type(username);
          cy.get('input#password').type(password);

          cy.waitForJs();

          cy.get('button[type=submit]').click();

          cy.contains('Brukernavn og/eller passord er feil.');
        });
      });
  });
});
export {};
