const _ = require('lodash');
const Bluebird = require('bluebird');
const request = require('supertest');
const passportStub = require('passport-stub');
const chai = require('chai');
const app = require('../../app');
const User = require('../../app/models/user');
const helpers = require('./helpers');
const testAdminResource = helpers.testAdminResource;
const test404 = helpers.test404;
const createUsers = helpers.createUsers;
const should = chai.should();

const hash = '$2a$10$qxTI.cWwa2kwcjx4SI9KAuV4KxuhtlGOk33L999UQf1rux.4PBz7y'; // 'password'
function createExtraUsers() {
  const numbers = _.range(10);
  return Bluebird.map(numbers, number =>
    User.create({
      username: `${number}testuser`,
      cardKey: `${number}TESTCARDKEY`,
      active: true,
      admin: false,
      hash
    })
  );
}

describe('User API', () => {
  before(() => {
    passportStub.install(app);
  });

  beforeEach(function() {
    passportStub.logout();

    return createUsers()
      .bind(this)
      .spread(function(user, adminUser) {
        this.user = user;
        this.adminUser = adminUser;
      });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall();
  });

  const testUserData = {
    username: 'newuser',
    password: 'password',
    cardKey: '00TESTCARDKEY'
  };

  const badUsernameData = {
    username: 'hi',
    password: 'password',
    cardKey: '11TESTCARDKEY'
  };

  it('should be possible to create users', function(done) {
    passportStub.login(this.adminUser);
    request(app)
      .post('/api/user')
      .send(testUserData)
      .expect(201)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);

        const createdUser = res.body;
        createdUser.active.should.equal(true);
        createdUser.admin.should.equal(false);

        return User.findOne({ username: testUserData.username })
          .then(user => {
            should.not.exist(user.password);
            createdUser.username.should.equal(user.username);
          })
          .nodeify(done);
      });
  });

  it('should not be possible to create users with invalid usernames', function(done) {
    passportStub.login(this.adminUser);
    request(app)
      .post('/api/user')
      .send(badUsernameData)
      .expect(400)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        const error = res.body;
        error.name.should.equal('ValidationError');
        error.message.should.equal('Validation failed.');
        error.status.should.equal(400);
        error.errors.username.path.should.equal('username');
        error.errors.username.message.should.equal(
          'Path `username` is invalid (hi).'
        );
        done();
      });
  });

  it('should return 400 when creating users with an already used card key', function(done) {
    passportStub.login(this.adminUser);

    const payload = _.clone(testUserData);
    payload.cardKey = helpers.testUser.cardKey;

    request(app)
      .post('/api/user')
      .send(payload)
      .expect(400)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        const error = res.body;
        error.name.should.equal('DuplicateCardError');
        error.status.should.equal(400);
        error.message.should.equal(
          "There's already a user registered to this card."
        );
        done();
      });
  });

  it('should not be possible to create users without being admin', function(done) {
    passportStub.login(this.user);
    testAdminResource('post', '/api/user', done);
  });

  it('should return 400 when creating users without required fields', function(done) {
    passportStub.login(this.adminUser);
    request(app)
      .post('/api/user')
      .expect(400)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        const error = res.body;
        error.name.should.equal('InvalidRegistrationError');
        error.status.should.equal(400);
        done();
      });
  });

  it('should be able to get users', function(done) {
    passportStub.login(this.adminUser);
    request(app)
      .get('/api/user')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        const users = res.body;
        users.length.should.equal(2);

        should.exist(users[0].username);
        should.exist(users[0].active);
        should.exist(users[0].admin);
        should.not.exist(users[0].password);
        done();
      });
  });

  it('should be able to toggle active users', function(done) {
    passportStub.login(this.adminUser);
    request(app)
      .post(`/api/user/${this.user.cardKey}/toggle_active`)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        const user = res.body;
        user.active.should.equal(false, 'user should be inactive');
        done();
      });
  });

  it('should not be possible to get users without being admin', function(done) {
    passportStub.login(this.user);
    testAdminResource('get', '/api/user', done);
  });

  it('should not be possible to toggle a user without being admin', function(done) {
    passportStub.login(this.user);
    testAdminResource(
      'post',
      `/api/user/${this.user.cardKey}/toggle_active`,
      done
    );
  });

  it('should get 404 when toggeling active users with invalid cardKey', function(done) {
    passportStub.login(this.adminUser);
    test404('post', '/api/user/LELELENEET/toggle_active', 'user', done);
  });

  it('should be possible to count active users', function(done) {
    passportStub.login(this.adminUser);
    this.user.active = true;

    this.user
      .save()
      .then(() => {
        request(app)
          .get('/api/user/count?active=true')
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            if (err) return done(err);
            const count = res.body.users;
            count.should.equal(1);
            done();
          });
      })
      .catch(done);
  });

  it('should be possible to count inactive users', function(done) {
    passportStub.login(this.adminUser);

    request(app)
      .get('/api/user/count?active=false')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        const count = res.body.users;
        count.should.equal(0);
        done();
      });
  });

  it('should be possible to count all users', function(done) {
    passportStub.login(this.adminUser);
    this.user.active = false;

    this.user
      .save()
      .then(() => {
        request(app)
          .get('/api/user/count')
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            if (err) return done(err);
            const count = res.body.users;
            count.should.equal(1);
            done();
          });
      })
      .catch(done);
  });

  it('should only be possible to count users as admin', function(done) {
    passportStub.login(this.user);
    testAdminResource('get', '/api/user/count', done);
  });

  it("should be possible to change a user's card key", function(done) {
    passportStub.login(this.adminUser);

    const changeCardPayload = {
      password: 'password',
      cardKey: 'thisisanewcardkey'
    };

    request(app)
      .put(`/api/user/${this.user.username}/change_card`)
      .send(changeCardPayload)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        const user = res.body;
        user.cardKey.should.equal(changeCardPayload.cardKey);
        done();
      });
  });

  it("should not be possible to change a user's card key to an existing card", function(done) {
    passportStub.login(this.adminUser);

    const changeCardPayload = {
      password: 'password',
      cardKey: '55TESTCARDKEY'
    };

    request(app)
      .put(`/api/user/${this.user.username}/change_card`)
      .send(changeCardPayload)
      .expect(400)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        const error = res.body;
        error.name.should.equal('DuplicateCardError');
        error.status.should.equal(400);
        error.message.should.equal(
          "There's already a user registered to this card."
        );
        done();
      });
  });

  it('should give feedback if wrong credentials are given when changing cards', function(done) {
    passportStub.login(this.adminUser);

    const changeCardPayload = {
      password: 'notthepassword',
      cardKey: 'somecardkey'
    };

    request(app)
      .put(`/api/user/${this.user.username}/change_card`)
      .send(changeCardPayload)
      .expect(400)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        const error = res.body;
        error.name.should.equal('InvalidRegistrationError');
        error.status.should.equal(400);
        error.message.should.equal('Incorrect username and/or password.');
        done();
      });
  });

  it('should only be possible to change cards as an admin', function(done) {
    passportStub.login(this.user);
    testAdminResource('put', '/api/user/user/change_card', done);
  });

  it('should be possible to deactivate all non-admin users', function(done) {
    passportStub.login(this.adminUser);

    createExtraUsers().then(() => {
      request(app)
        .post('/api/user/deactivate')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          return User.find()
            .then(users => {
              users.forEach(user => {
                if (user.admin) user.active.should.equal(true);
                else user.active.should.equal(false);
              });
            })
            .nodeify(done);
        });
    });
  });

  it('should not be possible to deactivate all users without being admin', function(done) {
    passportStub.login(this.user);
    testAdminResource('post', '/api/user/deactivate', done);
  });
});
