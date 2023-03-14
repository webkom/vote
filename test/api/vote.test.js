import { describe, test, beforeEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Types } from 'mongoose';
import passportStub from 'passport-stub';
import chai from 'chai';
import app from '../../app';
import Alternative from '../../app/models/alternative';
import Election from '../../app/models/election';
import { ElectionSystems as ElectionTypes } from '../../app/types/types';
import Vote from '../../app/models/vote';
import { test404, testAdminResource } from './helpers';
import { createUsers } from '../helpers';
const ObjectId = Types.ObjectId;

const should = chai.should();

describe('Vote API', () => {
  // Define a normal election
  const activeNormalElectionData = {
    title: 'activeElection',
    description: 'test election',
    type: ElectionTypes.NORMAL,
    active: true,
  };
  const inactiveNormalElectionData = {
    title: 'inactiveElection',
    type: ElectionTypes.NORMAL,
    description: 'inactive election',
  };
  const activeNormalAlternative = {
    description: 'active election alt',
  };
  const otherActiveNormalAlternative = {
    description: 'other active election alt',
  };
  const inactiveNormalAlternative = {
    description: 'inactive election alt',
  };

  // Define a stv election
  const activeSTVElectionData = {
    ...activeNormalElectionData,
    type: ElectionTypes.STV,
  };

  const inactiveSTVElectionData = {
    ...inactiveNormalElectionData,
    type: ElectionTypes.STV,
  };

  const activeSTVAlternative = {
    description: 'active election alt',
  };

  const otherActiveSTVAlternative = {
    description: 'other active election alt',
  };

  const inactiveSTVAlternative = {
    description: 'inactive election alt',
  };

  const votePayload = (inputElection, inputPriorities) => {
    return {
      election: inputElection,
      priorities: inputPriorities,
    };
  };

  beforeAll(() => {
    passportStub.install(app);
  });

  beforeEach(async function (ctx) {
    // Create Normal Election
    const [activeNormalCreated, inactiveNormalCreated] = await Election.create([
      activeNormalElectionData,
      inactiveNormalElectionData,
    ]);
    ctx.activeNormalElection = activeNormalCreated;
    ctx.inactiveNormalElection = inactiveNormalCreated;
    activeNormalAlternative.election = ctx.activeNormalElection;
    inactiveNormalAlternative.election = ctx.inactiveNormalElection;
    ctx.activeNormalAlternative = new Alternative(activeNormalAlternative);
    ctx.otherActiveNormalAlternative = new Alternative(
      otherActiveNormalAlternative
    );
    await ctx.activeNormalElection.addAlternative(ctx.activeNormalAlternative);
    await ctx.activeNormalElection.addAlternative(
      ctx.otherActiveNormalAlternative
    );
    ctx.inactiveNormalAlternative = new Alternative(inactiveNormalAlternative);
    await ctx.inactiveNormalElection.addAlternative(
      ctx.inactiveNormalAlternative
    );

    // Create STV Election
    const [activeSTVCreated, inactiveSTVCreated] = await Election.create([
      activeSTVElectionData,
      inactiveSTVElectionData,
    ]);
    ctx.activeSTVElection = activeSTVCreated;
    ctx.inactiveSTVElection = inactiveSTVCreated;
    activeSTVAlternative.election = ctx.activeSTVElection;
    inactiveSTVAlternative.election = ctx.inactiveSTVElection;
    ctx.activeSTVAlternative = new Alternative(activeSTVAlternative);
    ctx.otherActiveSTVAlternative = new Alternative(otherActiveSTVAlternative);
    await ctx.activeSTVElection.addAlternative(ctx.activeSTVAlternative);
    await ctx.activeSTVElection.addAlternative(ctx.otherActiveSTVAlternative);
    ctx.inactiveSTVAlternative = new Alternative(inactiveSTVAlternative);
    await ctx.inactiveSTVElection.addAlternative(ctx.inactiveSTVAlternative);

    // Define users
    const [user, adminUser, moderatorUser] = await createUsers();
    ctx.user = user;
    ctx.adminUser = adminUser;
    ctx.moderatorUser = moderatorUser;
    passportStub.login(user.username);
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall();
  });

  test('should not be possible to vote without election', async () => {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send({ priorities: [] })
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal('Missing property election from payload.');
  });

  test('should not be possible to vote with election that is an array', async () => {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload([], []))
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal('Missing property election from payload.');
  });

  test('should not be possible to vote with election that is an string', async () => {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload('string', []))
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal('Missing property election from payload.');
  });

  test('should not be possible to vote without priorities', async () => {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send({ election: {} })
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal('Missing property priorities from payload.');
  });

  test('should not be possible to vote with priorities that is not a list', async () => {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload({}, ''))
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal('Missing property priorities from payload.');
  });

  test('should not be possible to vote on a nonexistent election', async () => {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload({ _id: new ObjectId() }, []))
      .expect(404)
      .expect('Content-Type', /json/);
    error.status.should.equal(404);
    error.message.should.equal(`Couldn't find election.`);
  });

  test('should not be possible to vote on STV election with to many priorities', async function (ctx) {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(
        votePayload(ctx.activeSTVElection, [
          ctx.activeSTVAlternative,
          ctx.otherActiveSTVAlternative,
          ctx.inactiveSTVAlternative,
        ])
      )
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal(
      'Priorities is of length 3, election has 2 alternatives.'
    );
  });

  test('should not be possible to vote on Normal election with to many priorities', async function (ctx) {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(
        votePayload(ctx.activeNormalElection, [
          ctx.activeNormalAlternative,
          ctx.otherActiveNormalAlternative,
        ])
      )
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal(
      'Priorities is of length 2 on a normal election.'
    );
  });

  test('should not be possible to vote on STV election with priorities not listed in election', async function (ctx) {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(
        votePayload(ctx.activeSTVElection, [
          ctx.activeSTVAlternative,
          ctx.inactiveSTVAlternative,
        ])
      )
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal(
      'One or more alternatives does not exist on election.'
    );
  });

  test('should not be possible to vote on Normal election with priorities not listed in election', async function (ctx) {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(
        votePayload(ctx.activeNormalElection, [ctx.inactiveNormalAlternative])
      )
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal(
      'One or more alternatives does not exist on election.'
    );
  });

  test('should not be possible to vote on STV election with priorities that are not alternatives', async function (ctx) {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(ctx.activeSTVElection, ['String', {}]))
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal(
      'One or more alternatives does not exist on election.'
    );
  });

  test('should not be possible to vote on Normal election with priorities that are not alternatives', async function (ctx) {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(ctx.activeNormalElection, [{}]))
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal(
      'One or more alternatives does not exist on election.'
    );
  });

  test('should be able to vote on active STV election with an empty priority list', async function (ctx) {
    const { body: vote } = await request(app)
      .post('/api/vote')
      .send(votePayload(ctx.activeSTVElection, []))
      .expect(201)
      .expect('Content-Type', /json/);

    should.exist(vote.hash);
    vote.priorities.length.should.equal(0);

    const votes = await Vote.find({ hash: vote.hash });
    votes.length.should.equal(1);
  });

  test('should be able to vote on active Normal election with an empty priority list', async function (ctx) {
    const { body: vote } = await request(app)
      .post('/api/vote')
      .send(votePayload(ctx.activeNormalElection, []))
      .expect(201)
      .expect('Content-Type', /json/);

    should.exist(vote.hash);
    vote.priorities.length.should.equal(0);

    const votes = await Vote.find({ hash: vote.hash });
    votes.length.should.equal(1);
  });

  test('should be able to vote on active STV election with a priority list shorter then the election', async function (ctx) {
    const { body: vote } = await request(app)
      .post('/api/vote')
      .send(votePayload(ctx.activeSTVElection, [ctx.activeSTVAlternative]))
      .expect(201)
      .expect('Content-Type', /json/);

    should.exist(vote.hash);
    vote.priorities.length.should.equal(1);
    vote.priorities[0].should.equal(ctx.activeSTVAlternative.id);

    const votes = await Vote.find({ hash: vote.hash });
    votes.length.should.equal(1);
  });

  test('should be able to vote on active STV election with a full priority list', async function (ctx) {
    const { body: vote } = await request(app)
      .post('/api/vote')
      .send(
        votePayload(ctx.activeSTVElection, [
          ctx.activeSTVAlternative,
          ctx.otherActiveSTVAlternative,
        ])
      )
      .expect(201)
      .expect('Content-Type', /json/);

    should.exist(vote.hash);
    vote.priorities.length.should.equal(2);
    vote.priorities[0].should.equal(ctx.activeSTVAlternative.id);
    vote.priorities[1].should.equal(ctx.otherActiveSTVAlternative.id);

    const votes = await Vote.find({ hash: vote.hash });
    votes.length.should.equal(1);
  });

  test('should be able to vote only once on STV election', async function (ctx) {
    await ctx.activeSTVElection.addVote(ctx.user, [ctx.activeSTVAlternative]);
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(ctx.activeSTVElection, [ctx.otherActiveSTVAlternative]))
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('AlreadyVotedError');
    error.message.should.equal('You can only vote once per election.');
    error.status.should.equal(400);
  });

  test('should be able to vote only once on Normal election', async function (ctx) {
    await ctx.activeNormalElection.addVote(ctx.user, [
      ctx.activeNormalAlternative,
    ]);
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(
        votePayload(ctx.activeNormalElection, [
          ctx.otherActiveNormalAlternative,
        ])
      )
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('AlreadyVotedError');
    error.message.should.equal('You can only vote once per election.');
    error.status.should.equal(400);
  });

  test('should not be vulnerable to race conditions', async function (ctx) {
    const create = () =>
      request(app)
        .post('/api/vote')
        .send(votePayload(ctx.activeSTVElection, [ctx.activeSTVAlternative]));
    const reqs = await Promise.all([
      create(),
      create(),
      create(),
      create(),
      create(),
      create(),
      create(),
      create(),
      create(),
      create(),
    ]);
    const votes = await Vote.find({ election: ctx.activeSTVElection._id });
    votes.length.should.equal(1);
    reqs.filter((req) => req.status === 201).length.should.equal(1);
    reqs.some((req) => req.status === 409).should.be.true;
  });

  test('should not be possible to vote without logging in', async function (ctx) {
    passportStub.logout();
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(ctx.activeElection, [ctx.activeAlternative]))
      .expect(401)
      .expect('Content-Type', /json/);
    error.status.should.equal(401);
    error.message.should.equal(
      'You need to be logged in to access this resource.'
    );
  });

  test('should not be able to vote with inactive user', async function (ctx) {
    ctx.user.active = false;
    await ctx.user.save();
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(ctx.activeNormalElection, []))
      .expect(403)
      .expect('Content-Type', /json/);
    error.message.should.equal(
      `Can't vote with an inactive user: ${ctx.user.username}`
    );
    error.status.should.equal(403);

    const votes = await Vote.find({
      alternative: ctx.activeNormalAlternative.id,
    });
    votes.length.should.equal(0, 'no vote should be added');
  });

  test('should not be able to vote on a deactivated STV election', async function (ctx) {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(ctx.inactiveSTVElection, []))
      .expect(400)
      .expect('Content-Type', /json/);
    error.name.should.equal('InactiveElectionError');
    error.message.should.equal("Can't vote on an inactive election.");
    error.status.should.equal(400);

    const votes = await Vote.find({ election: ctx.inactiveSTVElection.id });
    votes.length.should.equal(0, 'no vote should be added');
  });

  test('should not be able to vote on a deactivated Normal election', async function (ctx) {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(ctx.inactiveNormalElection, []))
      .expect(400)
      .expect('Content-Type', /json/);
    error.name.should.equal('InactiveElectionError');
    error.message.should.equal("Can't vote on an inactive election.");
    error.status.should.equal(400);

    const votes = await Vote.find({ election: ctx.inactiveNormalElection.id });
    votes.length.should.equal(0, 'no vote should be added');
  });

  test('should be possible to retrieve a vote with hash', async function (ctx) {
    const vote = await ctx.activeNormalElection.addVote(ctx.user, []);
    const { body: receivedVote } = await request(app)
      .get('/api/vote')
      .set('Vote-Hash', vote.hash)
      .expect(200)
      .expect('Content-Type', /json/);
    receivedVote.hash.should.equal(vote.hash);
  });

  test('should be possible to retrieve a vote with correct election', async function (ctx) {
    const vote = await ctx.activeSTVElection.addVote(ctx.user, [
      ctx.activeSTVAlternative,
      ctx.otherActiveSTVAlternative,
    ]);
    const { body: receivedVote } = await request(app)
      .get('/api/vote')
      .set('Vote-Hash', vote.hash)
      .expect(200)
      .expect('Content-Type', /json/);
    receivedVote.election._id.should.equal(String(ctx.activeSTVElection.id));
    receivedVote.election.title.should.equal(
      String(ctx.activeSTVElection.title)
    );
    receivedVote.priorities.length.should.equal(2);
    receivedVote.priorities[0].description.should.equal(
      activeSTVAlternative.description
    );
    receivedVote.priorities[1].description.should.equal(
      otherActiveSTVAlternative.description
    );
  });

  test('should return 400 when retrieving votes without header', async () => {
    const { body: error } = await request(app)
      .get('/api/vote')
      .expect(400)
      .expect('Content-Type', /json/);

    error.message.should.equal('Missing header Vote-Hash.');
    error.status.should.equal(400);
  });

  test('should be possible to sum votes', async function (ctx) {
    passportStub.login(ctx.adminUser.username);

    await ctx.activeSTVElection.addVote(ctx.user, [
      ctx.activeSTVAlternative,
      ctx.otherActiveSTVAlternative,
    ]);
    ctx.activeSTVElection.active = false;
    await ctx.activeSTVElection.save();
    const { body } = await request(app)
      .get(`/api/election/${ctx.activeSTVElection.id}/votes`)
      .expect(200)
      .expect('Content-Type', /json/);

    body.result.status.should.equal('RESOLVED');
  });

  test('should not be possible to get votes on an active election', async function (ctx) {
    passportStub.login(ctx.adminUser.username);

    const { body } = await request(app)
      .get(`/api/election/${ctx.activeSTVElection.id}/votes`)
      .expect(400)
      .expect('Content-Type', /json/);
    body.message.should.equal('Cannot retrieve results on an active election.');
  });

  test('should not be possible to sum votes for a normal user', async function (ctx) {
    passportStub.login(ctx.user.username);
    await testAdminResource(
      'get',
      `/api/election/${ctx.activeSTVElection.id}/votes`
    );
  });

  test('should not be possible to sum votes for a moderator', async function (ctx) {
    passportStub.login(ctx.moderatorUser.username);
    await testAdminResource(
      'get',
      `/api/election/${ctx.activeSTVElection.id}/votes`
    );
  });

  test('should get 404 when summing votes for invalid electionIds', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    await test404('get', '/api/election/badid/votes', 'election');
  });

  test('should get 404 when summing votes for nonexistent electionIds', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const badId = new ObjectId();
    await test404('get', `/api/election/${badId}/votes`, 'election');
  });

  test('should return 403 when admins try to vote', async function (ctx) {
    passportStub.login(ctx.adminUser.username);
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(ctx.activeSTVElection, []))
      .expect(403)
      .expect('Content-Type', /json/);

    error.name.should.equal('AdminVotingError');
    error.message.should.equal("Admin users can't vote.");
    error.status.should.equal(403);
  });

  test('should return 403 when moderators try to vote', async function (ctx) {
    passportStub.login(ctx.moderatorUser.username);
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(ctx.activeSTVElection, []))
      .expect(403)
      .expect('Content-Type', /json/);

    error.name.should.equal('ModeratorVotingError');
    error.message.should.equal("Moderator users can't vote.");
    error.status.should.equal(403);
  });
});
