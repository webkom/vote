const ObjectId = require('mongoose').Types.ObjectId;
const request = require('supertest');
const passportStub = require('passport-stub');
const chai = require('chai');
const app = require('../../app');
const Alternative = require('../../app/models/alternative');
const Election = require('../../app/models/election');
const Vote = require('../../app/models/vote');
const { test404, testAdminResource } = require('./helpers');
const { createUsers } = require('../helpers');
const chaiSubset = require('chai-subset');

const should = chai.should();
chai.use(chaiSubset);

describe('Vote API', () => {
  const activeElectionData = {
    title: 'activeElection',
    description: 'test election',
    active: true,
  };

  const inactiveElectionData = {
    title: 'inactiveElection',
    description: 'inactive election',
  };

  const activeData = {
    description: 'active election alt',
  };

  const otherActiveData = {
    description: 'other active election alt',
  };

  const inactiveData = {
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
    const [activeCreated, inactiveCreated] = await Election.create([
      activeElectionData,
      inactiveElectionData,
    ]);

    this.activeElection = activeCreated;
    this.inactiveElection = inactiveCreated;

    activeData.election = this.activeElection;
    inactiveData.election = this.inactiveElection;

    this.activeAlternative = new Alternative(activeData);
    this.otherActiveAlternative = new Alternative(otherActiveData);
    await this.activeElection.addAlternative(this.activeAlternative);
    await this.activeElection.addAlternative(this.otherActiveAlternative);

    this.inactiveAlternative = new Alternative(inactiveData);
    await this.inactiveElection.addAlternative(this.inactiveAlternative);

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

  it('should not be possible to vote with to many priorities', async function () {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(
        votePayload(this.activeElection, [
          this.activeAlternative,
          this.otherActiveAlternative,
          this.inactiveAlternative,
        ])
      )
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal(
      'Priorities is of length 3, election has 2 alternatives.'
    );
  });

  it('should not be possible to vote with priorities not listed in election', async function () {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(
        votePayload(this.activeElection, [
          this.activeAlternative,
          this.inactiveAlternative,
        ])
      )
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal(
      'One or more alternatives does not exist on election.'
    );
  });

  it('should not be possible to vote with priorities that are not alternatives', async function () {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.activeElection, ['String', {}]))
      .expect(400)
      .expect('Content-Type', /json/);
    error.status.should.equal(400);
    error.message.should.equal(
      'One or more alternatives does not exist on election.'
    );
  });

  it('should be able to vote on active election with an empty priority list', async function () {
    const { body: vote } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.activeElection, []))
      .expect('Content-Type', /json/);

    should.exist(vote.hash);
    vote.priorities.length.should.equal(0);

    const votes = await Vote.find({ hash: vote.hash });
    votes.length.should.equal(1);
  });

  it('should be able to vote on active election with a priority list shorter then the election', async function () {
    const { body: vote } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.activeElection, [this.activeAlternative]))
      .expect('Content-Type', /json/);

    should.exist(vote.hash);
    vote.priorities.length.should.equal(1);
    vote.priorities[0].should.equal(this.activeAlternative.id);

    const votes = await Vote.find({ hash: vote.hash });
    votes.length.should.equal(1);
  });

  it('should be able to vote on active election with a full priority list', async function () {
    const { body: vote } = await request(app)
      .post('/api/vote')
      .send(
        votePayload(this.activeElection, [
          this.activeAlternative,
          this.otherActiveAlternative,
        ])
      )
      .expect('Content-Type', /json/);

    should.exist(vote.hash);
    vote.priorities.length.should.equal(2);
    vote.priorities[0].should.equal(this.activeAlternative.id);
    vote.priorities[1].should.equal(this.otherActiveAlternative.id);

    const votes = await Vote.find({ hash: vote.hash });
    votes.length.should.equal(1);
  });

  it('should be able to vote only once', async function () {
    await this.activeElection.addVote(this.user, [this.activeAlternative]);
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.activeElection, [this.otherActiveAlternative]))
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
        .send(votePayload(this.activeElection, [this.activeAlternative]));
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
    const votes = await Vote.find({ election: this.activeElection._id });
    votes.length.should.equal(1);
  });

  it('should not be possible to vote without logging in', async function () {
    passportStub.logout();
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload({}, []))
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
      .send(votePayload(this.activeElection, []))
      .expect(403)
      .expect('Content-Type', /json/);
    error.message.should.equal(
      `Can't vote with an inactive user: ${this.user.username}`
    );
    error.status.should.equal(403);

    const votes = await Vote.find({ alternative: this.activeAlternative.id });
    votes.length.should.equal(0, 'no vote should be added');
  });

  it('should not be able to vote on a deactivated election', async function () {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.inactiveElection, []))
      .expect(400)
      .expect('Content-Type', /json/);
    error.name.should.equal('InactiveElectionError');
    error.message.should.equal("Can't vote on an inactive election.");
    error.status.should.equal(400);

    const votes = await Vote.find({ election: this.inactiveElection.id });
    votes.length.should.equal(0, 'no vote should be added');
  });

  it('should be possible to retrieve a vote with hash', async function () {
    const vote = await this.activeElection.addVote(this.user, []);
    const { body: receivedVote } = await request(app)
      .get('/api/vote')
      .set('Vote-Hash', vote.hash)
      .expect(200)
      .expect('Content-Type', /json/);
    receivedVote.hash.should.equal(vote.hash);
  });

  it('should be possible to retrieve a vote with correct election', async function () {
    const vote = await this.activeElection.addVote(this.user, [
      this.activeAlternative,
    ]);
    const { body: receivedVote } = await request(app)
      .get('/api/vote')
      .set('Vote-Hash', vote.hash)
      .expect(200)
      .expect('Content-Type', /json/);
    receivedVote.election._id.should.equal(String(this.activeElection.id));
    receivedVote.election.title.should.equal(String(this.activeElection.title));
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

    await this.activeElection.addVote(this.user, [
      this.activeAlternative,
      this.otherActiveAlternative,
    ]);
    this.activeElection.active = false;
    await this.activeElection.save();
    const { body } = await request(app)
      .get(`/api/election/${this.activeElection.id}/votes`)
      .expect(200)
      .expect('Content-Type', /json/);

    body.should.containSubset({
      thr: 1,
      result: {
        status: 'RESOLVED',
      },
    });
  });

  it('should not be possible to get votes on an active election', async function () {
    passportStub.login(this.adminUser.username);

    const { body } = await request(app)
      .get(`/api/election/${this.activeElection.id}/votes`)
      .expect(400)
      .expect('Content-Type', /json/);
    body.message.should.equal('Cannot retrieve results on an active election.');
  });

  it('should not be possible to sum votes for a normal user', async function () {
    passportStub.login(this.user.username);
    await testAdminResource(
      'get',
      `/api/election/${this.activeElection.id}/votes`
    );
  });

  it('should not be possible to sum votes for a moderator', async function () {
    passportStub.login(this.moderatorUser.username);
    await testAdminResource(
      'get',
      `/api/election/${this.activeElection.id}/votes`
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
      .send(votePayload(this.activeElection, []))
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
      .send(votePayload(this.activeElection, []))
      .expect(403)
      .expect('Content-Type', /json/);

    error.name.should.equal('ModeratorVotingError');
    error.message.should.equal("Moderator users can't vote.");
    error.status.should.equal(403);
  });
});
