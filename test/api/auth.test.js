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
    await request(app).post('/api/auth/login').send(testUser).expect(200);
  });

  test('should make sure usernames are case-insensitive', async () => {
    const newUser = Object.assign(testUser, {
      username: testUser.username.toUpperCase(),
    });

    await request(app).post('/api/auth/login').send(newUser).expect(200);
  });

  test('should strip spaces on login', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({
        username: `${testUser.username}    `,
        password: testUser.password,
      })
      .expect(200);
  });

  test('should redirect to login with flash on bad auth', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send(badTestUser).expect(401);
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
        agent.post('/api/auth/logout').expect(302).end(checkSessions);
      }

      function login(err) {
        if (err) return done(err);
        const agent = request.agent(app);
        agent
          .post('/api/auth/login')
          .expect(200)
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
