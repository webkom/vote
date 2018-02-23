const Bluebird = require('bluebird');
const request = require('supertest');
const mongoose = require('mongoose');
const chai = require('chai');
const passportStub = require('passport-stub');
const app = require('../../app');
const User = require('../../app/models/user');

chai.should();

describe('Auth API', () => {
  const testUser = {
    username: 'testuser',
    password: 'test121312313',
    cardKey: '99TESTCARDKEY'
  };

  const adminUser = {
    username: 'admin',
    password: 'admin',
    admin: true,
    cardKey: '11TESTCARDKEY'
  };

  const badTestUser = {
    username: 'testuser',
    password: 'notthecorrectpw',
    cardKey: '00TESTCARDKEY'
  };

  beforeEach(() => {
    passportStub.logout();
    passportStub.uninstall();
    return Bluebird.all([
      User.register(testUser, testUser.password),
      User.register(adminUser, adminUser.password)
    ]);
  });

  it('should be able to authenticate users', async () => {
    const { header } = await request(app)
      .post('/auth/login')
      .send(testUser)
      .expect(302);

    header.location.should.equal('/');
  });

  it('should make sure usernames are case-insensitive', async () => {
    const newUser = Object.assign(testUser, {
      username: testUser.username.toUpperCase()
    });

    const { header } = await request(app)
      .post('/auth/login')
      .send(newUser)
      .expect(302);

    header.location.should.equal('/');
  });

  it('should strip spaces on login', async () => {
    const { header } = await request(app)
      .post('/auth/login')
      .send({
        username: `${testUser.username}    `,
        password: testUser.password
      })
      .expect(302);

    header.location.should.equal('/');
  });

  it('should redirect correctly on login', async () => {
    const agent = request.agent(app);
    await agent.get('/test').expect(302);
    const { header } = await agent
      .post('/auth/login')
      .send(testUser)
      .expect(302);

    header.location.should.equal('/test');
  });

  it('should redirect to login with flash on bad auth', async () => {
    const agent = request.agent(app);
    const { header } = await agent
      .post('/auth/login')
      .send(badTestUser)
      .expect(302);
    header.location.should.equal('/auth/login');

    const { text } = await agent
      .get('/auth/login')
      .expect(200)
      .expect('Content-Type', /text\/html/);
    text.should.include('Brukernavn og/eller passord er feil.');
  });

  it('should be possible to logout', done => {
    const sessions = mongoose.connection.db.collection('sessions');

    function checkSessions(err, res) {
      if (err) return done(err);
      res.header.location.should.equal('/auth/login');
      sessions.find({}).toArray((sessionErr, newSessions) => {
        if (sessionErr) return done(sessionErr);
        newSessions.length.should.equal(0);
        done();
      });
    }

    function logout(err, agent) {
      if (err) return done(err);
      agent
        .post('/auth/logout')
        .expect(302)
        .end(checkSessions);
    }

    function login(err) {
      if (err) return done(err);
      const agent = request.agent(app);
      agent
        .post('/auth/login')
        .expect(302)
        .send(testUser)
        .end(newErr => logout(newErr, agent));
    }

    sessions.remove({}, {}, login);
  });

  it('should redirect from / to /admin for admins', async () => {
    passportStub.install(app);
    passportStub.login(adminUser);

    await request(app)
      .get('/')
      .expect(302)
      .expect('Location', '/admin');
  });
});
