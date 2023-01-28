import { describe, test, beforeAll, beforeEach, afterAll } from 'vitest';
import passportStub from 'passport-stub';
import { Types } from 'mongoose';
import request from 'supertest';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import app from '../../app';
import Election from '../../app/models/election';
import { ElectionSystems as ElectionTypes } from '../../app/types/types';
import Alternative from '../../app/models/alternative';
import Vote from '../../app/models/vote';
import { test404, testAdminResource } from './helpers';
import { createUsers } from '../helpers';
const ObjectId = Types.ObjectId;

const should = chai.should();
chai.use(sinonChai);

describe('Election API', () => {
  const activeElectionData = {
    title: 'activeElection1',
    description: 'active election 1',
    active: true,
    accessCode: 1234,
    physical: false,
  };

  const inactiveElectionData = {
    title: 'inactiveElection1',
    description: 'inactive election 1',
  };

  const electionWithAlternative = {
    title: 'electionWithAlternative',
    description: 'alternative election',
    alternatives: [
      {
        description: 'election alternative 1',
      },
      {
        description: 'election alternative 2',
      },
    ],
  };

  const testAlternative = {
    description: 'test alternative',
  };

  const ioStub = {
    emit: sinon.stub(),
  };

  beforeAll(() => {
    passportStub.install(app);
    app.set('io', ioStub);
  });

  beforeEach(async function (ctx) {
    passportStub.logout();
    ioStub.emit.reset();

    ctx.activeElection = await new Election(activeElectionData).save();
    testAlternative.election = ctx.activeElection;
    ctx.alternative = new Alternative(testAlternative);
    await ctx.activeElection.addAlternative(ctx.alternative);
    const [user, adminUser, moderatorUser] = await createUsers();
    ctx.user = user;
    ctx.adminUser = adminUser;
    ctx.moderatorUser = moderatorUser;
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall();
  });

  test('should be able to create elections', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const { body } = await request(app)
      .post('/api/election')
      .send(inactiveElectionData)
      .expect(201)
      .expect('Content-Type', /json/);

    body.title.should.equal(
      inactiveElectionData.title,
      'db election title hash should be the same as api result'
    );

    body.description.should.equal(
      inactiveElectionData.description,
      'db election description hash should be the same as api result'
    );

    body.active.should.equal(false, 'db election should not be active');
    body.hasVotedUsers.should.be.an.instanceof(Array);
  });

  test('should be able to create elections with alternatives', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const { body } = await request(app)
      .post('/api/election')
      .send(electionWithAlternative)
      .expect(201)
      .expect('Content-Type', /json/);

    body.title.should.equal(
      electionWithAlternative.title,
      'db election title hash should be the same as api result'
    );

    body.description.should.equal(
      electionWithAlternative.description,
      'db election description hash should be the same as api result'
    );

    body.active.should.equal(false, 'db election should not be active');
    body.alternatives.length.should.not.equal(
      0,
      'db election should contain alternatives'
    );
    body.alternatives[0].description.should.equal(
      electionWithAlternative.alternatives[0].description,
      'db election alternative should be correct'
    );

    body.alternatives[1].description.should.equal(
      electionWithAlternative.alternatives[1].description,
      'db election alternative should be correct'
    );
  });

  test('should return 400 when creating elections without required fields', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const { body: error } = await request(app)
      .post('/api/election')
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('ValidationError');
    error.status.should.equal(400);
    error.errors.title.path.should.equal('title');
    error.errors.title.kind.should.equal('required');
  });

  test('should be able to create elections with one seat', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const { body } = await request(app)
      .post('/api/election')
      .send({
        title: 'Election',
        description: 'ElectionDesc',
        type: ElectionTypes.STV,
        seats: 1,
      })
      .expect(201)
      .expect('Content-Type', /json/);

    body.title.should.equal('Election');
    body.description.should.equal('ElectionDesc');
    body.active.should.equal(false);
  });

  test('should be able to create elections with two seats', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const { body } = await request(app)
      .post('/api/election')
      .send({
        title: 'Election',
        description: 'ElectionDesc',
        type: ElectionTypes.STV,
        seats: 2,
      })
      .expect(201)
      .expect('Content-Type', /json/);

    body.title.should.equal('Election');
    body.description.should.equal('ElectionDesc');
    body.active.should.equal(false);
  });

  test('should return 400 when creating elections with zero seats', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const { body: error } = await request(app)
      .post('/api/election')
      .send({
        title: 'Election',
        description: 'ElectionDesc',
        type: ElectionTypes.STV,
        seats: 0,
      })
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('ValidationError');
    error.errors.seats.message.should.equal(
      'An election should have at least one seat'
    );
    error.status.should.equal(400);
  });

  test('should return 400 when creating elections with negative seats', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const { body: error } = await request(app)
      .post('/api/election')
      .send({
        title: 'Election',
        description: 'ElectionDesc',
        type: ElectionTypes.STV,
        seats: -1,
      })
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('ValidationError');
    error.errors.seats.message.should.equal(
      'An election should have at least one seat'
    );
    error.status.should.equal(400);
  });

  test('should be able to create strict elections with one seat', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const { body } = await request(app)
      .post('/api/election')
      .send({
        title: 'StrictElection',
        description: 'StrictElectionDesc',
        type: ElectionTypes.STV,
        seats: 1,
        useStrict: true,
      })
      .expect(201)
      .expect('Content-Type', /json/);

    body.title.should.equal('StrictElection');
    body.description.should.equal('StrictElectionDesc');
    body.active.should.equal(false);
  });

  test('should return 400 when creating strict elections with more then one seat', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const { body: error } = await request(app)
      .post('/api/election')
      .send({
        title: 'StrictElection',
        description: 'StrictElectionDesc',
        type: ElectionTypes.STV,
        seats: 2,
        useStrict: true,
      })
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('ValidationError');
    error.errors.useStrict.message.should.equal(
      'Strict elections must have exactly one seat'
    );
    error.status.should.equal(400);
  });

  test('should return 400 when creating normal elections with more then one seat', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const { body: error } = await request(app)
      .post('/api/election')
      .send({
        title: 'NormalElection',
        description: 'NormalElectionDesc',
        seats: 2,
        type: ElectionTypes.NORMAL,
        useStrict: false,
      })
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('ValidationError');
    error.errors.type.message.should.equal(
      'Normal elections must have exactly one seat'
    );
    error.status.should.equal(400);
  });

  test('should return 400 when creating strict elections with less then one seat', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const { body: error } = await request(app)
      .post('/api/election')
      .send({
        title: 'StrictElection',
        description: 'StrictElectionDesc',
        seats: -1,
        useStrict: true,
      })
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('ValidationError');
    error.errors.useStrict.message.should.equal(
      'Strict elections must have exactly one seat'
    );
    error.status.should.equal(400);
  });

  test('should not be possible to create elections as normal user', async function (ctx) {
    passportStub.login(ctx.user.username);
    await testAdminResource('post', '/api/election');
  });

  test('should not be possible to create elections as moderator', async function (ctx) {
    passportStub.login(ctx.moderatorUser.username);
    await testAdminResource('post', '/api/election');
  });

  test('should be able to get all elections as admin', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const { body } = await request(app)
      .get('/api/election')
      .expect(200)
      .expect('Content-Type', /json/);

    body[0].title.should.equal(
      ctx.activeElection.title,
      'db election title hash should be the same as api result'
    );

    body[0].description.should.equal(
      ctx.activeElection.description,
      'db election description hash should be the same as api result'
    );

    body[0]._id.should.equal(
      ctx.activeElection.id,
      'db election id hash should be the same as api result'
    );
  });

  test('should not be possible to get elections as normal user', async function (ctx) {
    passportStub.login(ctx.user.username);
    await testAdminResource('get', '/api/election');
  });

  test('should not be possible to get elections as moderator', async function (ctx) {
    passportStub.login(ctx.moderatorUser.username);
    await testAdminResource('get', '/api/election');
  });

  test('should be able to get an election and its alternatives as admin', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const { body } = await request(app)
      .get(`/api/election/${ctx.activeElection.id}`)
      .expect(200)
      .expect('Content-Type', /json/);

    body.title.should.equal(ctx.activeElection.title);
    body.description.should.equal(ctx.activeElection.description);
    body.active.should.equal(true);
    body.alternatives.length.should.equal(1);
    body.alternatives[0]._id.should.equal(ctx.alternative.id);
  });

  test('should not be possible to retrieve alternatives as normal user', async function (ctx) {
    passportStub.login(ctx.user.username);
    await testAdminResource('get', `/api/election/${ctx.activeElection.id}`);
  });

  test('should not be possible to retrieve alternatives as moderator', async function (ctx) {
    passportStub.login(ctx.moderatorUser.username);
    await testAdminResource('get', `/api/election/${ctx.activeElection.id}`);
  });

  test('should get 404 for missing elections', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const badId = new ObjectId();
    await test404('get', `/api/election/${badId}`, 'election');
  });

  test('should get 404 when retrieving alternatives with an invalid ObjectId', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    await test404('get', '/api/election/badelection', 'election');
  });

  test('should not be possible to have two activate elections', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    // There is by default an active election on the database
    const election = await Election.create(inactiveElectionData);
    await request(app)
      .post(`/api/election/${election.id}/activate`)
      .expect(409)
      .expect('Content-Type', /json/);
    ioStub.emit.should.not.have.been.calledWith('election');
  });

  test('should be possible to activate an election', async function (ctx) {
    // Deactivate the one default elections
    ctx.activeElection.active = false;
    ctx.activeElection.save();

    passportStub.login(ctx.adminUser.username);

    const election = await Election.create(inactiveElectionData);
    const { body } = await request(app)
      .post(`/api/election/${election.id}/activate`)
      .expect(200)
      .expect('Content-Type', /json/);

    ioStub.emit.should.have.been.calledWith('election');
    body.description.should.equal(election.description);
    body.active.should.equal(true, 'db election should be active');
  });

  test('should get 404 when activating a missing election', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const badId = new ObjectId();
    await test404('post', `/api/election/${badId}/activate`, 'election');
  });

  test('should get 404 when activating an election with an invalid ObjectId', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    await test404('post', '/api/election/badid/activate', 'election');
  });

  test('should not be possible to activate elections as normal user', async function (ctx) {
    passportStub.login(ctx.user.username);
    await testAdminResource(
      'post',
      `/api/election/${ctx.activeElection.id}/activate`
    );
  });

  test('should not be possible to activate elections as moderator', async function (ctx) {
    passportStub.login(ctx.user.username);
    await testAdminResource(
      'post',
      `/api/election/${ctx.activeElection.id}/activate`
    );
  });

  test('should be able to deactivate an election', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const { body } = await request(app)
      .post(`/api/election/${ctx.activeElection.id}/deactivate`)
      .expect(200)
      .expect('Content-Type', /json/);
    ioStub.emit.should.have.been.called;
    body.active.should.equal(false, 'db election should not be active');
  });

  test('should get 404 when deactivating a missing election', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const badId = new ObjectId();
    await test404('post', `/api/election/${badId}/deactivate`, 'election');
  });

  test('should get 404 when deactivating an election with an invalid ObjectId', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    await test404('post', '/api/election/badid/deactivate', 'election');
  });

  test('should not be possible to deactivate elections as normal user', async function (ctx) {
    passportStub.login(ctx.user.username);
    await testAdminResource(
      'post',
      `/api/election/${ctx.activeElection.id}/deactivate`
    );
  });

  test('should not be possible to deactivate elections as moderator', async function (ctx) {
    passportStub.login(ctx.moderatorUser.username);
    await testAdminResource(
      'post',
      `/api/election/${ctx.activeElection.id}/deactivate`
    );
  });

  test('should be possible to delete elections', async function (ctx) {
    passportStub.login(ctx.adminUser.username);

    const vote = new Vote({
      priorities: [ctx.alternative],
      election: ctx.activeElection,
      hash: 'ctxisahash',
    });

    ctx.activeElection.active = false;

    await vote.save();
    ctx.activeElection.votes = [vote];
    await ctx.activeElection.save();

    const { body } = await request(app)
      .delete(`/api/election/${ctx.activeElection.id}`)
      .expect(200)
      .expect('Content-Type', /json/);

    body.message.should.equal('Election deleted.');
    body.status.should.equal(200);

    const elections = await Election.find();
    const alternatives = await Alternative.find();
    const votes = await Vote.find();

    elections.length.should.equal(0);
    alternatives.length.should.equal(0);
    votes.length.should.equal(0);
  });

  test('should not be possible to delete active elections', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const { body: error } = await request(app)
      .delete(`/api/election/${ctx.activeElection.id}`)
      .expect(400)
      .expect('Content-Type', /json/);

    error.status.should.equal(400);
    error.message.should.equal('Cannot delete an active election.');
  });

  test('should not be possible to delete elections as normal user', async function (ctx) {
    passportStub.login(ctx.user.username);
    await testAdminResource('delete', '/api/election/badid');
  });

  test('should not be possible to delete elections as moderator', async function (ctx) {
    passportStub.login(ctx.moderatorUser.username);
    await testAdminResource('delete', '/api/election/badid');
  });

  test('should get 404 when deleting elections with invalid ObjectIds', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    await test404('delete', '/api/election/badid', 'election');
  });

  test('should get 404 when deleting elections with nonexistent ObjectIds', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const badId = new ObjectId();
    await test404('delete', `/api/election/${badId}`, 'election');
  });

  test('should be possible to retrieve active elections for active user', async function (ctx) {
    passportStub.login(ctx.user.username);
    const { body } = await request(app)
      .get('/api/election/active')
      .expect(200)
      .expect('Content-Type', /json/);

    body.title.should.equal(ctx.activeElection.title);
    body.description.should.equal(ctx.activeElection.description);
    body.alternatives[0].description.should.equal(ctx.alternative.description);
    should.not.exist(body.hasVotedUsers);
  });

  test('should not be possible to retrieve active elections for inactive user', async function (ctx) {
    ctx.user.active = false;
    await ctx.user.save();
    passportStub.login(ctx.user.username);
    await request(app).get('/api/election/active').expect(403);
  });

  test('should be possible to retrieve active elections for inactive users with the correct accesscode', async function (ctx) {
    ctx.user.active = false;
    await ctx.user.save();
    passportStub.login(ctx.user.username);
    const { body } = await request(app)
      .get('/api/election/active?accessCode=1234')
      .expect(200)
      .expect('Content-Type', /json/);

    body.title.should.equal(ctx.activeElection.title);
    body.description.should.equal(ctx.activeElection.description);
    body.alternatives[0].description.should.equal(ctx.alternative.description);
    should.not.exist(body.hasVotedUsers);
  });

  test('should not be possible to retrieve active elections for inactive users with wrong accesscode', async function (ctx) {
    ctx.user.active = false;
    await ctx.user.save();
    passportStub.login(ctx.user.username);
    await request(app).get('/api/election/active?accessCode=1235').expect(403);
  });

  test('should filter out elections the user has voted on', async function (ctx) {
    passportStub.login(ctx.user.username);
    ctx.activeElection.hasVotedUsers.push(ctx.user._id);

    await ctx.activeElection.save();
    await request(app).get('/api/election/active').expect(404);
  });

  test('should be possible to list the number of users that have voted', async function (ctx) {
    passportStub.login(ctx.adminUser.username);

    await ctx.activeElection.addVote(ctx.user, [ctx.alternative]);
    const { body } = await request(app)
      .get(`/api/election/${ctx.activeElection.id}/count`)
      .expect(200)
      .expect('Content-Type', /json/);

    body.users.should.equal(1);
  });

  test('should not be possible to count voted users as normal user', async function (ctx) {
    passportStub.login(ctx.user.username);
    await testAdminResource(
      'get',
      `/api/election/${ctx.activeElection.id}/count`
    );
  });

  test('should not be possible to count voted users as moderator', async function (ctx) {
    passportStub.login(ctx.moderatorUser.username);
    await testAdminResource(
      'get',
      `/api/election/${ctx.activeElection.id}/count`
    );
  });

  test('should get 404 when counting votes for elections with invalid ObjectIds', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    await test404('get', '/api/election/badid/count', 'election');
  });

  test('should get 404 when counting votes for elections with nonexistent ObjectIds', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const badId = new ObjectId();
    await test404('get', `/api/election/${badId}/count`, 'election');
  });
});
