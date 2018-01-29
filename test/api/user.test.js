const _ = require('lodash');
const request = require('supertest');
const passportStub = require('passport-stub');
const chai = require('chai');
const app = require('../../app');
const User = require('../../app/models/user');
const { test404, testAdminResource } = require('./helpers');
const { testUser, createUsers } = require('../helpers');

const should = chai.should();

describe('User API', () => {
  before(() => {
    passportStub.install(app);
  });

  beforeEach(async function() {
    passportStub.logout();

    const [user, adminUser] = await createUsers();
    this.user = user;
    this.adminUser = adminUser;
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

  it('should be possible to create users', async function() {
    passportStub.login(this.adminUser);
    const { body } = await request(app)
      .post('/api/user')
      .send(testUserData)
      .expect(201)
      .expect('Content-Type', /json/);

    body.active.should.equal(true);
    body.admin.should.equal(false);
    const user = await User.findOne({ username: testUserData.username });
    should.not.exist(user.password);
    body.username.should.equal(user.username);
  });

  it('should not be possible to create users with invalid usernames', async function() {
    passportStub.login(this.adminUser);
    const { body: error } = await request(app)
      .post('/api/user')
      .send(badUsernameData)
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('ValidationError');
    error.message.should.equal('Validation failed.');
    error.status.should.equal(400);
    error.errors.username.path.should.equal('username');
    error.errors.username.message.should.equal(
      'Path `username` is invalid (hi).'
    );
  });

  it('should return 400 when creating users with an already used card key', async function() {
    passportStub.login(this.adminUser);

    const payload = _.clone(testUserData);
    payload.cardKey = testUser.cardKey;

    const { body: error } = await request(app)
      .post('/api/user')
      .send(payload)
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('DuplicateCardError');
    error.status.should.equal(400);
    error.message.should.equal(
      "There's already a user registered to this card."
    );
  });

  it('should return 400 when creating users with existing usernames', async function() {
    passportStub.login(this.adminUser);
    const payload = Object.assign({}, testUserData, {
      username: this.user.username
    });

    const { body: error } = await request(app)
      .post('/api/user')
      .send(payload)
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('DuplicateUsernameError');
    error.status.should.equal(400);
    error.message.should.equal("There's already a user with this username.");
  });

  it('should not be possible to create users without being admin', async function() {
    passportStub.login(this.user);
    await testAdminResource('post', '/api/user');
  });

  it('should return 400 when creating users without required fields', async function() {
    passportStub.login(this.adminUser);
    const { body: error } = await request(app)
      .post('/api/user')
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('InvalidRegistrationError');
    error.status.should.equal(400);
  });

  it('should be able to get users', async function() {
    passportStub.login(this.adminUser);
    const { body: users } = await request(app)
      .get('/api/user')
      .expect(200)
      .expect('Content-Type', /json/);

    users.length.should.equal(2);
    should.exist(users[0].username);
    should.exist(users[0].active);
    should.exist(users[0].admin);
    should.not.exist(users[0].password);
  });

  it('should be able to toggle active users', async function() {
    passportStub.login(this.adminUser);
    const { body } = await request(app)
      .post(`/api/user/${this.user.cardKey}/toggle_active`)
      .expect(200)
      .expect('Content-Type', /json/);
    body.active.should.equal(false, 'user should be inactive');
  });

  it('should not be possible to get users without being admin', async function() {
    passportStub.login(this.user);
    await testAdminResource('get', '/api/user');
  });

  it('should not be possible to toggle a user without being admin', async function() {
    passportStub.login(this.user);
    await testAdminResource(
      'post',
      `/api/user/${this.user.cardKey}/toggle_active`
    );
  });

  it('should get 404 when toggeling active users with invalid cardKey', async function() {
    passportStub.login(this.adminUser);
    test404('post', '/api/user/LELELENEET/toggle_active', 'user');
  });

  it('should be possible to count active users', async function() {
    passportStub.login(this.adminUser);
    this.user.active = true;

    await this.user.save();
    const { body } = await request(app)
      .get('/api/user/count?active=true')
      .expect(200)
      .expect('Content-Type', /json/);
    body.users.should.equal(1);
  });

  it('should be possible to count inactive users', async function() {
    passportStub.login(this.adminUser);
    const { body } = await request(app)
      .get('/api/user/count?active=false')
      .expect(200)
      .expect('Content-Type', /json/);
    body.users.should.equal(0);
  });

  it('should be possible to count all users', async function() {
    passportStub.login(this.adminUser);
    this.user.active = false;
    await this.user.save();
    const { body } = await request(app)
      .get('/api/user/count')
      .expect(200)
      .expect('Content-Type', /json/);
    body.users.should.equal(1);
  });

  it('should only be possible to count users as admin', async function() {
    passportStub.login(this.user);
    await testAdminResource('get', '/api/user/count');
  });

  it("should be possible to change a user's card key", async function() {
    passportStub.login(this.adminUser);

    const changeCardPayload = {
      password: 'password',
      cardKey: 'thisisanewcardkey'
    };

    const { body } = await request(app)
      .put(`/api/user/${this.user.username}/change_card`)
      .send(changeCardPayload)
      .expect(200)
      .expect('Content-Type', /json/);
    body.cardKey.should.equal(changeCardPayload.cardKey);
  });

  it("should not be possible to change a user's card key to an existing card", async function() {
    passportStub.login(this.adminUser);

    const changeCardPayload = {
      password: 'password',
      cardKey: '55TESTCARDKEY'
    };

    const { body: error } = await request(app)
      .put(`/api/user/${this.user.username}/change_card`)
      .send(changeCardPayload)
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('DuplicateCardError');
    error.status.should.equal(400);
    error.message.should.equal(
      "There's already a user registered to this card."
    );
  });

  it('should give feedback if wrong credentials are given when changing cards', async function() {
    passportStub.login(this.adminUser);

    const changeCardPayload = {
      password: 'notthepassword',
      cardKey: 'somecardkey'
    };

    const { body: error } = await request(app)
      .put(`/api/user/${this.user.username}/change_card`)
      .send(changeCardPayload)
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('InvalidRegistrationError');
    error.status.should.equal(400);
    error.message.should.equal('Incorrect username and/or password.');
  });

  it('should only be possible to change cards as an admin', async function() {
    passportStub.login(this.user);
    await testAdminResource('put', '/api/user/user/change_card');
  });

  it('should be possible to deactivate all non-admin users', async function() {
    passportStub.login(this.adminUser);
    await request(app)
      .post('/api/user/deactivate')
      .expect(200)
      .expect('Content-Type', /json/);

    const users = await User.find();
    users.forEach(user => {
      if (user.admin) user.active.should.equal(true);
      else user.active.should.equal(false);
    });
  });

  it('should not be possible to deactivate all users without being admin', async function() {
    passportStub.login(this.user);
    await testAdminResource('post', '/api/user/deactivate');
  });
});
