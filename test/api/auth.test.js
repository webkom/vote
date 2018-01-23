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

  it('should be able to authenticate users', done => {
    request(app)
      .post('/auth/login')
      .send(testUser)
      .expect(302)
      .end((err, res) => {
        if (err) return done(err);
        res.header.location.should.equal('/');
        done();
      });
  });

  it('should make sure usernames are case-insensitive', done => {
    const newUser = Object.assign(testUser, {
      username: testUser.username.toUpperCase()
    });

    request(app)
      .post('/auth/login')
      .send(newUser)
      .expect(302)
      .end((err, res) => {
        if (err) return done(err);
        res.header.location.should.equal('/');
        done();
      });
  });

  it('should strip spaces on login', done => {
    request(app)
      .post('/auth/login')
      .send({
        username: `${testUser.username}    `,
        password: testUser.password
      })
      .expect(302)
      .end((err, res) => {
        if (err) return done(err);
        res.header.location.should.equal('/');
        done();
      });
  });

  it('should redirect correctly on login', done => {
    const agent = request.agent(app);
    agent
      .get('/test')
      .expect(302)
      .end(err => {
        if (err) return done(err);
        agent
          .post('/auth/login')
          .send(testUser)
          .expect(302)
          .end((loginErr, res) => {
            if (loginErr) return done(loginErr);
            res.header.location.should.equal('/test');
            done();
          });
      });
  });

  it('should redirect to login with flash on bad auth', done => {
    const agent = request.agent(app);
    function logout(err, res) {
      if (err) return done(err);
      res.header.location.should.equal('/auth/login');

      agent
        .get('/auth/login')
        .expect(200)
        .expect('Content-Type', /text\/html/)
        .end((loginErr, loginRes) => {
          if (loginErr) return done(loginErr);
          loginRes.text.should.include('Brukernavn og/eller passord er feil.');
          done();
        });
    }

    agent
      .post('/auth/login')
      .send(badTestUser)
      .expect(302)
      .end(logout);
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

    sessions.drop(login);
  });

  it('should redirect from / to /admin for admins', done => {
    passportStub.install(app);
    passportStub.login(adminUser);

    request(app)
      .get('/')
      .expect(302)
      .expect('Location', '/admin')
      .end(done);
  });
});
