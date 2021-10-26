import request from 'supertest';
import passportStub from 'passport-stub';
import app from '../../app';
import Register from '../../app/models/register';
import { createUsers } from '../helpers';

describe('Register API', () => {
  before(() => {
    passportStub.install(app);
  });

  beforeEach(async function () {
    const [user, adminUser, moderatorUser] = await createUsers();
    this.user = user;
    this.adminUser = adminUser;
    this.moderatorUser = moderatorUser;

    // Create a register and user entry
    passportStub.login(this.moderatorUser.username);
    await request(app)
      .post('/api/user/generate')
      .send({ identifier: 'username', email: 'email@domain.com' });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall();
  });

  it('should be possible for a moderator to get a list of registers', async function () {
    passportStub.login(this.moderatorUser.username);
    const { body } = await request(app)
      .get('/api/register')
      .expect(200)
      .expect('Content-Type', /json/);
    body.length.should.equal(1);
    body[0].identifier.should.equal('username');
    body[0].email.should.equal('email@domain.com');
  });

  it('should not be possible for a user to get a list of registers', async function () {
    passportStub.login(this.user.username);
    const { body: error } = await request(app)
      .get('/api/register')
      .expect(403)
      .expect('Content-Type', /json/);
    error.status.should.equal(403);
  });

  it('should be possible for a moderator to delete a register', async function () {
    const entry = await Register.findOne({});

    passportStub.login(this.moderatorUser.username);
    const { body } = await request(app)
      .delete(`/api/register/${entry._id}`)
      .expect(200)
      .expect('Content-Type', /json/);
    body.status.should.equal(200);
  });

  it('should not be possible for a user to delete a register', async function () {
    passportStub.login(this.user.username);
    const { body: error } = await request(app)
      .delete('/api/register/123')
      .expect(403)
      .expect('Content-Type', /json/);
    error.status.should.equal(403);
  });

  it('should throw ValidationError on invalid registerId', async function () {
    passportStub.login(this.moderatorUser.username);
    const { body: error } = await request(app)
      .delete(`/api/register/wrong123`)
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.name.should.equal('ValidationError');
    error.message.should.equal('Validation failed.');
    error.errors.should.equal('Invalid ObjectID');
  });

  it('should throw NotFoundError on wrong registerId', async function () {
    passportStub.login(this.moderatorUser.username);
    const { body: error } = await request(app)
      .delete(`/api/register/601d7354542bba5f8bf4e6f9`)
      .expect(404)
      .expect('Content-Type', /json/);
    error.status.should.equal(404);
    error.name.should.equal('NotFoundError');
    error.message.should.equal("Couldn't find register.");
  });

  it('should not be possible for a moderator to delete a register with no user', async function () {
    const entry = await Register.findOne({});
    entry.user = null;
    await entry.save();

    passportStub.login(this.moderatorUser.username);
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
