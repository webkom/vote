import { describe, test, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import chai from 'chai';
import passportStub from 'passport-stub';
import app from '../../app';
import User from '../../app/models/user';

chai.should();

describe('Auth API', () => {
  const testUser = {
    username: 'testuser',
    password: 'test121312313',
    cardKey: '99TESTCARDKEY',
  };

  const adminUser = {
    username: 'admin',
    password: 'admin',
    admin: true,
    cardKey: '11TESTCARDKEY',
  };

  const badTestUser = {
    username: 'testuser',
    password: 'notthecorrectpw',
    cardKey: '00TESTCARDKEY',
  };

  beforeEach(async () => {
    passportStub.logout();
    passportStub.uninstall();
    await Promise.all([
      User.register(testUser, testUser.password),
      User.register(adminUser, adminUser.password),
    ]);
  });

  test('should be able to authenticate users', async () => {
    const { header } = await request(app)
      .post('/auth/login')
      .send(testUser)
      .expect(302);

    header.location.should.equal('/');
  });

  test('should make sure usernames are case-insensitive', async () => {
    const newUser = Object.assign(testUser, {
      username: testUser.username.toUpperCase(),
    });

    const { header } = await request(app)
      .post('/auth/login')
      .send(newUser)
      .expect(302);

    header.location.should.equal('/');
  });

  test('should strip spaces on login', async () => {
    const { header } = await request(app)
      .post('/auth/login')
      .send({
        username: `${testUser.username}    `,
        password: testUser.password,
      })
      .expect(302);

    header.location.should.equal('/');
  });

  test('should redirect to login with flash on bad auth', async () => {
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

  test('should be possible to logout', () =>
    new Promise((done) => {
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
        agent.post('/auth/logout').expect(302).end(checkSessions);
      }

      function login(err) {
        if (err) return done(err);
        const agent = request.agent(app);
        agent
          .post('/auth/login')
          .expect(302)
          .send(testUser)
          .end((newErr) => logout(newErr, agent));
      }

      sessions.deleteMany({}, {}, login);
    }));

  test('should redirect from / to /admin for admins', async () => {
    passportStub.install(app);
    passportStub.login(adminUser.username);

    await request(app).get('/').expect(302).expect('Location', '/admin');
  });
});
