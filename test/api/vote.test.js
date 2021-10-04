const ObjectId = require('mongoose').Types.ObjectId;
const request = require('supertest');
const passportStub = require('passport-stub');
const chai = require('chai');
const app = require('../../app');
const Alternative = require('../../app/models/alternative');
const Election = require('../../app/models/election');
const ElectionTypes = require('../../app/models/utils.js');
const Vote = require('../../app/models/vote');
const { test404, testAdminResource } = require('./helpers');
const { createUsers } = require('../helpers');

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

  before(() => {
    passportStub.install(app);
  });

  beforeEach(async function () {
    // Create Normal Election
    const [activeNormalCreated, inactiveNormalCreated] = await Election.create([
      activeNormalElectionData,
      inactiveNormalElectionData,
    ]);
    this.activeNormalElection = activeNormalCreated;
    this.inactiveNormalElection = inactiveNormalCreated;
    activeNormalAlternative.election = this.activeNormalElection;
    inactiveNormalAlternative.election = this.inactiveNormalElection;
    this.activeNormalAlternative = new Alternative(activeNormalAlternative);
    this.otherActiveNormalAlternative = new Alternative(
      otherActiveNormalAlternative
    );
    await this.activeNormalElection.addAlternative(
      this.activeNormalAlternative
    );
    await this.activeNormalElection.addAlternative(
      this.otherActiveNormalAlternative
    );
    this.inactiveNormalAlternative = new Alternative(inactiveNormalAlternative);
    await this.inactiveNormalElection.addAlternative(
      this.inactiveNormalAlternative
    );

    // Create STV Election
    const [activeSTVCreated, inactiveSTVCreated] = await Election.create([
      activeSTVElectionData,
      inactiveSTVElectionData,
    ]);
    this.activeSTVElection = activeSTVCreated;
    this.inactiveSTVElection = inactiveSTVCreated;
    activeSTVAlternative.election = this.activeSTVElection;
    inactiveSTVAlternative.election = this.inactiveSTVElection;
    this.activeSTVAlternative = new Alternative(activeSTVAlternative);
    this.otherActiveSTVAlternative = new Alternative(otherActiveSTVAlternative);
    await this.activeSTVElection.addAlternative(this.activeSTVAlternative);
    await this.activeSTVElection.addAlternative(this.otherActiveSTVAlternative);
    this.inactiveSTVAlternative = new Alternative(inactiveSTVAlternative);
    await this.inactiveSTVElection.addAlternative(this.inactiveSTVAlternative);

    // Define users
    const [user, adminUser, moderatorUser] = await createUsers();
    this.user = user;
    this.adminUser = adminUser;
    this.moderatorUser = moderatorUser;
    passportStub.login(user.username);
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall();
  });

  it('should not be possible to vote without election', async () => {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send({ priorities: [] })
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal('Missing property election from payload.');
  });

  it('should not be possible to vote with election that is an array', async () => {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload([], []))
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal('Missing property election from payload.');
  });

  it('should not be possible to vote with election that is an string', async () => {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload('string', []))
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal('Missing property election from payload.');
  });

  it('should not be possible to vote without priorities', async () => {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send({ election: {} })
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal('Missing property priorities from payload.');
  });

  it('should not be possible to vote with priorities that is not a list', async () => {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload({}, ''))
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal('Missing property priorities from payload.');
  });

  it('should not be possible to vote on a nonexistent election', async () => {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload({ _id: new ObjectId() }, []))
      .expect(404)
      .expect('Content-Type', /json/);
    error.status.should.equal(404);
    error.message.should.equal(`Couldn't find election.`);
  });

  it('should not be possible to vote on STV election with to many priorities', async function () {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(
        votePayload(this.activeSTVElection, [
          this.activeSTVAlternative,
          this.otherActiveSTVAlternative,
          this.inactiveSTVAlternative,
        ])
      )
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal(
      'Priorities is of length 3, election has 2 alternatives.'
    );
  });

  it('should not be possible to vote on Normal election with to many priorities', async function () {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(
        votePayload(this.activeNormalElection, [
          this.activeNormalAlternative,
          this.otherActiveNormalAlternative,
        ])
      )
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal(
      'Priorities is of length 2 on a normal election.'
    );
  });

  it('should not be possible to vote on STV election with priorities not listed in election', async function () {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(
        votePayload(this.activeSTVElection, [
          this.activeSTVAlternative,
          this.inactiveSTVAlternative,
        ])
      )
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal(
      'One or more alternatives does not exist on election.'
    );
  });

  it('should not be possible to vote on Normal election with priorities not listed in election', async function () {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(
        votePayload(this.activeNormalElection, [this.inactiveNormalAlternative])
      )
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal(
      'One or more alternatives does not exist on election.'
    );
  });

  it('should not be possible to vote on STV election with priorities that are not alternatives', async function () {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.activeSTVElection, ['String', {}]))
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal(
      'One or more alternatives does not exist on election.'
    );
  });

  it('should not be possible to vote on Normal election with priorities that are not alternatives', async function () {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.activeNormalElection, [{}]))
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal(
      'One or more alternatives does not exist on election.'
    );
  });

  it('should be able to vote on active STV election with an empty priority list', async function () {
    const { body: vote } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.activeSTVElection, []))
      .expect(201)
      .expect('Content-Type', /json/);

    should.exist(vote.hash);
    vote.priorities.length.should.equal(0);

    const votes = await Vote.find({ hash: vote.hash });
    votes.length.should.equal(1);
  });

  it('should be able to vote on active Normal election with an empty priority list', async function () {
    const { body: vote } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.activeNormalElection, []))
      .expect(201)
      .expect('Content-Type', /json/);

    should.exist(vote.hash);
    vote.priorities.length.should.equal(0);

    const votes = await Vote.find({ hash: vote.hash });
    votes.length.should.equal(1);
  });

  it('should be able to vote on active STV election with a priority list shorter then the election', async function () {
    const { body: vote } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.activeSTVElection, [this.activeSTVAlternative]))
      .expect(201)
      .expect('Content-Type', /json/);

    should.exist(vote.hash);
    vote.priorities.length.should.equal(1);
    vote.priorities[0].should.equal(this.activeSTVAlternative.id);

    const votes = await Vote.find({ hash: vote.hash });
    votes.length.should.equal(1);
  });

  it('should be able to vote on active STV election with a full priority list', async function () {
    const { body: vote } = await request(app)
      .post('/api/vote')
      .send(
        votePayload(this.activeSTVElection, [
          this.activeSTVAlternative,
          this.otherActiveSTVAlternative,
        ])
      )
      .expect(201)
      .expect('Content-Type', /json/);

    should.exist(vote.hash);
    vote.priorities.length.should.equal(2);
    vote.priorities[0].should.equal(this.activeSTVAlternative.id);
    vote.priorities[1].should.equal(this.otherActiveSTVAlternative.id);

    const votes = await Vote.find({ hash: vote.hash });
    votes.length.should.equal(1);
  });

  it('should be able to vote only once on STV election', async function () {
    await this.activeSTVElection.addVote(this.user, [
      this.activeSTVAlternative,
    ]);
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(
        votePayload(this.activeSTVElection, [this.otherActiveSTVAlternative])
      )
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('AlreadyVotedError');
    error.message.should.equal('You can only vote once per election.');
    error.status.should.equal(400);
  });

  it('should be able to vote only once on Normal election', async function () {
    await this.activeNormalElection.addVote(this.user, [
      this.activeNormalAlternative,
    ]);
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(
        votePayload(this.activeNormalElection, [
          this.otherActiveNormalAlternative,
        ])
      )
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('AlreadyVotedError');
    error.message.should.equal('You can only vote once per election.');
    error.status.should.equal(400);
  });

  it('should not be vulnerable to race conditions', async function () {
    const create = () =>
      request(app)
        .post('/api/vote')
        .send(votePayload(this.activeSTVElection, [this.activeSTVAlternative]));
    await Promise.all([
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
    const votes = await Vote.find({ election: this.activeSTVElection._id });
    votes.length.should.equal(1);
  });

  it('should not be possible to vote without logging in', async function () {
    passportStub.logout();
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.activeElection, [this.activeAlternative]))
      .expect(401)
      .expect('Content-Type', /json/);
    error.status.should.equal(401);
    error.message.should.equal(
      'You need to be logged in to access this resource.'
    );
  });

  it('should not be able to vote with inactive user', async function () {
    this.user.active = false;
    await this.user.save();
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.activeNormalElection, []))
      .expect(403)
      .expect('Content-Type', /json/);
    error.message.should.equal(
      `Can't vote with an inactive user: ${this.user.username}`
    );
    error.status.should.equal(403);

    const votes = await Vote.find({
      alternative: this.activeNormalAlternative.id,
    });
    votes.length.should.equal(0, 'no vote should be added');
  });

  it('should not be able to vote on a deactivated STV election', async function () {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.inactiveSTVElection, []))
      .expect(400)
      .expect('Content-Type', /json/);
    error.name.should.equal('InactiveElectionError');
    error.message.should.equal("Can't vote on an inactive election.");
    error.status.should.equal(400);

    const votes = await Vote.find({ election: this.inactiveSTVElection.id });
    votes.length.should.equal(0, 'no vote should be added');
  });

  it('should not be able to vote on a deactivated Normal election', async function () {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.inactiveNormalElection, []))
      .expect(400)
      .expect('Content-Type', /json/);
    error.name.should.equal('InactiveElectionError');
    error.message.should.equal("Can't vote on an inactive election.");
    error.status.should.equal(400);

    const votes = await Vote.find({ election: this.inactiveNormalElection.id });
    votes.length.should.equal(0, 'no vote should be added');
  });

  it('should be possible to retrieve a vote with hash', async function () {
    const vote = await this.activeNormalElection.addVote(this.user, []);
    const { body: receivedVote } = await request(app)
      .get('/api/vote')
      .set('Vote-Hash', vote.hash)
      .expect(200)
      .expect('Content-Type', /json/);
    receivedVote.hash.should.equal(vote.hash);
  });

  it('should be possible to retrieve a vote with correct election', async function () {
    const vote = await this.activeSTVElection.addVote(this.user, [
      this.activeSTVAlternative,
      this.otherActiveSTVAlternative,
    ]);
    const { body: receivedVote } = await request(app)
      .get('/api/vote')
      .set('Vote-Hash', vote.hash)
      .expect(200)
      .expect('Content-Type', /json/);
    receivedVote.election._id.should.equal(String(this.activeSTVElection.id));
    receivedVote.election.title.should.equal(
      String(this.activeSTVElection.title)
    );
    receivedVote.priorities.length.should.equal(2);
    receivedVote.priorities[0].description.should.equal(
      activeSTVAlternative.description
    );
    receivedVote.priorities[1].description.should.equal(
      otherActiveSTVAlternative.description
    );
  });

  it('should return 400 when retrieving votes without header', async () => {
    const { body: error } = await request(app)
      .get('/api/vote')
      .expect(400)
      .expect('Content-Type', /json/);

    error.message.should.equal('Missing header Vote-Hash.');
    error.status.should.equal(400);
  });

  it('should be possible to sum votes', async function () {
    passportStub.login(this.adminUser.username);

    await this.activeSTVElection.addVote(this.user, [
      this.activeSTVAlternative,
      this.otherActiveSTVAlternative,
    ]);
    this.activeSTVElection.active = false;
    await this.activeSTVElection.save();
    const { body } = await request(app)
      .get(`/api/election/${this.activeSTVElection.id}/votes`)
      .expect(200)
      .expect('Content-Type', /json/);

    body.result.status.should.equal('RESOLVED');
  });

  it('should not be possible to get votes on an active election', async function () {
    passportStub.login(this.adminUser.username);

    const { body } = await request(app)
      .get(`/api/election/${this.activeSTVElection.id}/votes`)
      .expect(400)
      .expect('Content-Type', /json/);
    body.message.should.equal('Cannot retrieve results on an active election.');
  });

  it('should not be possible to sum votes for a normal user', async function () {
    passportStub.login(this.user.username);
    await testAdminResource(
      'get',
      `/api/election/${this.activeSTVElection.id}/votes`
    );
  });

  it('should not be possible to sum votes for a moderator', async function () {
    passportStub.login(this.moderatorUser.username);
    await testAdminResource(
      'get',
      `/api/election/${this.activeSTVElection.id}/votes`
    );
  });

  it('should get 404 when summing votes for invalid electionIds', async function () {
    passportStub.login(this.adminUser.username);
    test404('get', '/api/election/badid/votes', 'election');
  });

  it('should get 404 when summing votes for nonexistent electionIds', async function () {
    passportStub.login(this.adminUser.username);
    const badId = new ObjectId();
    test404('get', `/api/election/${badId}/votes`, 'election');
  });

  it('should return 403 when admins try to vote', async function () {
    passportStub.login(this.adminUser.username);
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.activeSTVElection, []))
      .expect(403)
      .expect('Content-Type', /json/);

    error.name.should.equal('AdminVotingError');
    error.message.should.equal("Admin users can't vote.");
    error.status.should.equal(403);
  });

  it('should return 403 when moderators try to vote', async function () {
    passportStub.login(this.moderatorUser.username);
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.activeSTVElection, []))
      .expect(403)
      .expect('Content-Type', /json/);

    error.name.should.equal('ModeratorVotingError');
    error.message.should.equal("Moderator users can't vote.");
    error.status.should.equal(403);
  });
});
