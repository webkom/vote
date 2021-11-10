import passportStub from 'passport-stub';
import request from 'supertest';
import { Types } from 'mongoose';
import chai from 'chai';
import app from '../../app';
import Alternative from '../../app/models/alternative';
import Election from '../../app/models/election';
import { test404, testAdminResource } from './helpers';
import { createUsers } from '../helpers';
const ObjectId = Types.ObjectId;

chai.should();

describe('Alternatives API', () => {
  const testElectionData = {
    title: 'test election',
    description: 'test election description',
    active: false,
  };

  const createdAlternativeData = {
    description: 'test alternative 1',
  };

  const testAlternativeData = {
    description: 'test alternative 2',
  };

  before(() => {
    passportStub.install(app);
  });

  beforeEach(function () {
    const that = this;
    passportStub.logout();
    const election = new Election(testElectionData);
    return election
      .save()
      .then((createdElection) => {
        that.currentTest.election = createdElection;
        const alternative = new Alternative(createdAlternativeData);
        return election.addAlternative(alternative);
      })
      .then((alternative) => {
        that.currentTest.alternative = alternative;
        return createUsers();
      })
      .then(([user, adminUser, moderatorUser]) => {
        that.currenTest.user = user; // TODO: research mocha ctx
        that.currenTest.adminUser = adminUser;
        that.currenTest.moderatorUser = moderatorUser;
      });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall();
  });

  it('should be able to get alternatives as admin', async function () {
    passportStub.login(this.currentTest.adminUser.username);
    const res = await request(app)
      .get(`/api/election/${this.election.id}/alternatives`)
      .expect(200)
      .expect('Content-Type', /json/);

    res.body.length.should.equal(1);
    res.body[0].description.should.equal(
      this.alternative.description,
      'should be the same as api result'
    );
  });

  it('should be possible to get alternatives after adding them', async function () {
    passportStub.login(this.adminUser.username);
    await request(app)
      .post(`/api/election/${this.election.id}/alternatives`)
      .send(testAlternativeData)
      .expect(201)
      .expect('Content-Type', /json/);

    passportStub.login(this.adminUser.username);
    const res = await request(app)
      .get(`/api/election/${this.election.id}/alternatives`)
      .expect(200)
      .expect('Content-Type', /json/);

    res.body.length.should.equal(2);
    res.body[0].description.should.equal(
      this.alternative.description,
      'should be the same as api result'
    );
  });

  it('should not be possible to get alternatives as normal user', async function () {
    passportStub.login(this.user.username);
    await testAdminResource(
      'get',
      `/api/election/${this.election.id}/alternatives`
    );
  });

  it('should not be possible to get alternatives as moderator', async function () {
    passportStub.login(this.moderatorUser.username);
    await testAdminResource(
      'get',
      `/api/election/${this.election.id}/alternatives`
    );
  });

  it('should get 404 when listing alternatives for invalid electionIds', async function () {
    passportStub.login(this.adminUser.username);
    await test404('get', '/api/election/badid/alternatives', 'election');
  });

  it('should get 404 when listing alternatives for nonexistent electionIds', async function () {
    passportStub.login(this.adminUser.username);
    const badId = new ObjectId();
    await test404('get', `/api/election/${badId}/alternatives`, 'election');
  });

  it('should be able to create alternatives for deactivated elections', async function () {
    passportStub.login(this.adminUser.username);
    const res = await request(app)
      .post(`/api/election/${this.election.id}/alternatives`)
      .send(testAlternativeData)
      .expect(201)
      .expect('Content-Type', /json/);

    res.body.description.should.equal(testAlternativeData.description);
    res.status.should.equal(201);
  });

  it('should not be able to create alternatives for active elections', async function () {
    passportStub.login(this.adminUser.username);

    this.election.active = true;
    await this.election.save();
    const { body: error } = await request(app)
      .post(`/api/election/${this.election.id}/alternatives`)
      .send(testAlternativeData)
      .expect(400)
      .expect('Content-Type', /json/);

    error.status.should.equal(400);
    error.name.should.equal('ActiveElectionError');
    error.message.should.equal(
      'Cannot create alternatives for active elections.'
    );
  });

  it('should return 400 when creating alternatives without required fields', async function () {
    passportStub.login(this.adminUser.username);
    const { body: error } = await request(app)
      .post(`/api/election/${this.election.id}/alternatives`)
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('ValidationError');
    error.status.should.equal(400);
    error.errors.description.path.should.equal('description');
    error.errors.description.kind.should.equal('required');
  });

  it('should get 404 when creating alternatives for invalid electionIds', async function () {
    passportStub.login(this.adminUser.username);
    await test404('post', '/api/election/badid/alternatives', 'election');
  });

  it('should get 404 when creating alternatives for nonexistent electionIds', async function () {
    passportStub.login(this.adminUser.username);
    const badId = new ObjectId();
    await test404('post', `/api/election/${badId}/alternatives`, 'election');
  });

  it('should not be possible to create alternatives as normal user', async function () {
    passportStub.login(this.user.username);
    await testAdminResource(
      'post',
      `/api/election/${this.election.id}/alternatives`
    );
  });

  it('should not be possible to create alternatives as moderator', async function () {
    passportStub.login(this.user.username);
    await testAdminResource(
      'post',
      `/api/election/${this.election.id}/alternatives`
    );
  });
});
