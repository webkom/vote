import { describe, test as it, beforeAll, beforeEach, afterAll } from 'vitest';
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

  beforeAll(() => {
    passportStub.install(app);
  });

  beforeEach(async function (ctx) {
    passportStub.logout();
    const election = new Election(testElectionData);

    const createdElection = await election.save();

    ctx.election = createdElection;
    const alternative = new Alternative(createdAlternativeData);
    return election
      .addAlternative(alternative)
      .then((alternative) => {
        ctx.alternative = alternative;
        return createUsers();
      })
      .then(([user, adminUser, moderatorUser]) => {
        ctx.user = user;
        ctx.adminUser = adminUser;
        ctx.moderatorUser = moderatorUser;
      });
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall();
  });

  it('should be able to get alternatives as admin', async function ({
    adminUser,
    election,
    alternative,
  }) {
    passportStub.login(adminUser.username);
    const res = await request(app)
      .get(`/api/election/${election.id}/alternatives`)
      .expect(200)
      .expect('Content-Type', /json/);

    res.body.length.should.equal(1);
    res.body[0].description.should.equal(
      alternative.description,
      'should be the same as api result'
    );
  });

  it('should be possible to get alternatives after adding them', async function ({
    adminUser,
    election,
    alternative,
  }) {
    passportStub.login(adminUser.username);
    await request(app)
      .post(`/api/election/${election.id}/alternatives`)
      .send(testAlternativeData)
      .expect(201)
      .expect('Content-Type', /json/);

    passportStub.login(adminUser.username);
    const res = await request(app)
      .get(`/api/election/${election.id}/alternatives`)
      .expect(200)
      .expect('Content-Type', /json/);

    res.body.length.should.equal(2);
    res.body[0].description.should.equal(
      alternative.description,
      'should be the same as api result'
    );
  });

  it('should not be possible to get alternatives as normal user', async function ({
    user,
    election,
    alternative,
  }) {
    passportStub.login(user.username);
    await testAdminResource('get', `/api/election/${election.id}/alternatives`);
  });

  it('should not be possible to get alternatives as moderator', async function (ctx) {
    passportStub.login(ctx.moderatorUser.username);
    await testAdminResource(
      'get',
      `/api/election/${ctx.election.id}/alternatives`
    );
  });

  it('should get 404 when listing alternatives for invalid electionIds', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    await test404('get', '/api/election/badid/alternatives', 'election');
  });

  it('should get 404 when listing alternatives for nonexistent electionIds', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const badId = new ObjectId();
    await test404('get', `/api/election/${badId}/alternatives`, 'election');
  });

  it('should be able to create alternatives for deactivated elections', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const res = await request(app)
      .post(`/api/election/${ctx.election.id}/alternatives`)
      .send(testAlternativeData)
      .expect(201)
      .expect('Content-Type', /json/);

    res.body.description.should.equal(testAlternativeData.description);
    res.status.should.equal(201);
  });

  it('should not be able to create alternatives for active elections', async function (ctx) {
    passportStub.login(ctx.adminUser.username);

    ctx.election.active = true;
    await ctx.election.save();
    const { body: error } = await request(app)
      .post(`/api/election/${ctx.election.id}/alternatives`)
      .send(testAlternativeData)
      .expect(400)
      .expect('Content-Type', /json/);

    error.status.should.equal(400);
    error.name.should.equal('ActiveElectionError');
    error.message.should.equal(
      'Cannot create alternatives for active elections.'
    );
  });

  it('should return 400 when creating alternatives without required fields', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const { body: error } = await request(app)
      .post(`/api/election/${ctx.election.id}/alternatives`)
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('ValidationError');
    error.status.should.equal(400);
    error.errors.description.path.should.equal('description');
    error.errors.description.kind.should.equal('required');
  });

  it('should get 404 when creating alternatives for invalid electionIds', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    await test404('post', '/api/election/badid/alternatives', 'election');
  });

  it('should get 404 when creating alternatives for nonexistent electionIds', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const badId = new ObjectId();
    await test404('post', `/api/election/${badId}/alternatives`, 'election');
  });

  it('should not be possible to create alternatives as normal user', async function (ctx) {
    passportStub.login(ctx.user.username);
    await testAdminResource(
      'post',
      `/api/election/${ctx.election.id}/alternatives`
    );
  });

  it('should not be possible to create alternatives as moderator', async function (ctx) {
    passportStub.login(ctx.user.username);
    await testAdminResource(
      'post',
      `/api/election/${ctx.election.id}/alternatives`
    );
  });
});
