import { describe, test, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import passportStub from 'passport-stub';
import app from '../../app';
import Register from '../../app/models/register';
import { createUsers } from '../helpers';
import chai from 'chai';

chai.should();

describe('Register API', () => {
  beforeAll(() => {
    passportStub.install(app);
  });

  beforeEach(async function (ctx) {
    const [user, adminUser, moderatorUser] = await createUsers();
    ctx.user = user;
    ctx.adminUser = adminUser;
    ctx.moderatorUser = moderatorUser;

    // Create a register and user entry
    passportStub.login(ctx.moderatorUser.username);
    await request(app)
      .post('/api/user/generate')
      .send({ identifier: 'username', email: 'email@domain.com' });
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall();
  });

  test('should be possible for a moderator to get a list of registers', async function (ctx) {
    passportStub.login(ctx.moderatorUser.username);
    const { body } = await request(app)
      .get('/api/register')
      .expect(200)
      .expect('Content-Type', /json/);
    body.length.should.equal(1);
    body[0].identifier.should.equal('username');
    body[0].email.should.equal('email@domain.com');
  });

  test('should not be possible for a user to get a list of registers', async function (ctx) {
    passportStub.login(ctx.user.username);
    const { body: error } = await request(app)
      .get('/api/register')
      .expect(403)
      .expect('Content-Type', /json/);
    error.status.should.equal(403);
  });

  test('should be possible for a moderator to delete a register', async function (ctx) {
    const entry = await Register.findOne({});

    passportStub.login(ctx.moderatorUser.username);
    const { body } = await request(app)
      .delete(`/api/register/${entry._id}`)
      .expect(200)
      .expect('Content-Type', /json/);
    body.status.should.equal(200);
  });

  test('should not be possible for a user to delete a register', async function (ctx) {
    passportStub.login(ctx.user.username);
    const { body: error } = await request(app)
      .delete('/api/register/123')
      .expect(403)
      .expect('Content-Type', /json/);
    error.status.should.equal(403);
  });

  test('should throw ValidationError on invalid registerId', async function (ctx) {
    passportStub.login(ctx.moderatorUser.username);
    const { body: error } = await request(app)
      .delete(`/api/register/wrong123`)
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.name.should.equal('ValidationError');
    error.message.should.equal('Validation failed.');
    error.errors.should.equal('Invalid ObjectID');
  });

  test('should throw NotFoundError on wrong registerId', async function (ctx) {
    passportStub.login(ctx.moderatorUser.username);
    const { body: error } = await request(app)
      .delete(`/api/register/601d7354542bba5f8bf4e6f9`)
      .expect(404)
      .expect('Content-Type', /json/);
    error.status.should.equal(404);
    error.name.should.equal('NotFoundError');
    error.message.should.equal("Couldn't find register.");
  });

  test('should not be possible for a moderator to delete a register with no user', async function (ctx) {
    const entry = await Register.findOne({});
    entry.user = null;
    await entry.save();

    passportStub.login(ctx.moderatorUser.username);
    const { body: error } = await request(app)
      .delete(`/api/register/${entry._id}`)
      .expect(400);
    error.status.should.equal(400);
    error.name.should.equal('NoAssociatedUserError');
    error.message.should.equal(
      "Can't delete a register with no associated user"
    );
  });
});
