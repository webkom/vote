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

const should = chai.should();

describe('Vote API', () => {
  const activeElectionData = {
    title: 'activeElection',
    description: 'test election',
    active: true
  };

  const inactiveElectionData = {
    title: 'inactiveElection',
    description: 'inactive election'
  };

  const activeData = {
    description: 'active election alt'
  };

  const otherActiveData = {
    description: 'other active election alt'
  };

  const inactiveData = {
    description: 'inactive election alt'
  };

  function votePayload(alternativeId) {
    return {
      alternativeId: alternativeId
    };
  }

  before(() => {
    passportStub.install(app);
  });

  beforeEach(async function() {
    const [activeCreated, inactiveCreated] = await Election.create([
      activeElectionData,
      inactiveElectionData
    ]);

    this.activeElection = activeCreated;
    this.inactiveElection = inactiveCreated;

    activeData.election = this.activeElection;
    inactiveData.election = this.inactiveElection;
    this.activeAlternative = new Alternative(activeData);
    this.otherActiveAlternative = new Alternative(otherActiveData);
    this.inactiveAlternative = new Alternative(inactiveData);

    await this.activeElection.addAlternative(this.activeAlternative);
    await this.inactiveElection.addAlternative(this.inactiveAlternative);
    await this.activeElection.addAlternative(this.otherActiveAlternative);
    const [user, adminUser] = await createUsers();
    this.user = user;
    this.adminUser = adminUser;
    passportStub.login(user);
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall();
  });

  it('should not be possible to vote with an invalid ObjectId as alternativeId', async () => {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload('bad alternative'))
      .expect(404)
      .expect('Content-Type', /json/);
    error.status.should.equal(404);
    error.message.should.equal("Couldn't find alternative.");
  });

  it('should not be possible to vote with a nonexistent alternativeId', async () => {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(new ObjectId()))
      .expect(404)
      .expect('Content-Type', /json/);
    error.status.should.equal(404);
    error.message.should.equal("Couldn't find alternative.");
  });

  it('should not be possible to vote without an alternativeId in the payload', async () => {
    const { body: error } = await request(app)
      .post('/api/vote')
      .expect(400)
      .expect('Content-Type', /json/);

    error.status.should.equal(400);
    error.message.should.equal('Missing property alternativeId from payload.');
  });

  it('should be able to vote on alternative', async function() {
    const { body: vote } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.activeAlternative.id))
      .expect('Content-Type', /json/);

    should.exist(vote.hash);
    vote.alternative.description.should.equal(
      this.activeAlternative.description
    );

    const votes = await Vote.find({ alternative: this.activeAlternative.id });
    votes.length.should.equal(1);
  });

  it('should be able to vote only once', async function() {
    await this.activeAlternative.addVote(this.user);
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.otherActiveAlternative.id))
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('AlreadyVotedError');
    error.message.should.equal('You can only vote once per election.');
    error.status.should.equal(400);

    const votes = await Vote.find({ alternative: this.activeAlternative.id });
    votes.length.should.equal(1);
  });

  it('should not be possible to vote without logging in', async function() {
    passportStub.logout();
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.activeAlternative.id))
      .expect(401)
      .expect('Content-Type', /json/);
    error.status.should.equal(401);
    error.message.should.equal(
      'You need to be logged in to access this resource.'
    );
  });

  it('should not be able to vote with inactive user', async function() {
    this.user.active = false;
    await this.user.save();
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.activeAlternative.id))
      .expect(403)
      .expect('Content-Type', /json/);
    error.message.should.equal(
      `Can't vote with an inactive user: ${this.user.username}`
    );
    error.status.should.equal(403);

    const votes = await Vote.find({ alternative: this.activeAlternative.id });
    votes.length.should.equal(0, 'no vote should be added');
  });

  it('should not be able to vote on a deactivated election', async function() {
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.inactiveAlternative.id))
      .expect(400)
      .expect('Content-Type', /json/);
    error.name.should.equal('InactiveElectionError');
    error.message.should.equal("Can't vote on an inactive election.");
    error.status.should.equal(400);

    const votes = await Vote.find({ election: this.inactiveElection.id });
    votes.length.should.equal(0, 'no vote should be added');
  });

  it('should be possible to retrieve a vote', async function() {
    const vote = await this.activeAlternative.addVote(this.user);
    const { body: receivedVote } = await request(app)
      .get('/api/vote')
      .set('Vote-Hash', vote.hash)
      .expect(200)
      .expect('Content-Type', /json/);

    receivedVote.hash.should.equal(vote.hash);
    receivedVote.alternative._id.should.equal(String(vote.alternative));
    receivedVote.alternative.election.should.deep.equal({
      _id: String(this.activeElection.id),
      title: this.activeElection.title
    });
  });

  it('should return 400 when retrieving votes without header', async () => {
    const { body: error } = await request(app)
      .get('/api/vote')
      .expect(400)
      .expect('Content-Type', /json/);

    error.message.should.equal('Missing header Vote-Hash.');
    error.status.should.equal(400);
  });

  it('should be possible to sum votes', async function() {
    passportStub.login(this.adminUser);

    await this.otherActiveAlternative.addVote(this.user);
    const { body } = await request(app)
      .get(`/api/election/${this.inactiveElection.id}/votes`)
      .expect(200)
      .expect('Content-Type', /json/);

    body.length.should.equal(1);
    body[0].votes.should.equal(0);
  });

  it('should not be possible to get votes on an active election', async function() {
    passportStub.login(this.adminUser);

    const { body } = await request(app)
      .get(`/api/election/${this.activeElection.id}/votes`)
      .expect(400)
      .expect('Content-Type', /json/);
    body.message.should.equal('Cannot retrieve results on an active election.');
  });

  it('should not be possible to sum votes without being admin', async function() {
    passportStub.login(this.user);
    await testAdminResource(
      'get',
      `/api/election/${this.activeElection.id}/votes`
    );
  });

  it('should get 404 when summing votes for invalid electionIds', async function() {
    passportStub.login(this.adminUser);
    test404('get', '/api/election/badid/votes', 'election');
  });

  it('should get 404 when summing votes for nonexistent electionIds', async function() {
    passportStub.login(this.adminUser);
    const badId = new ObjectId();
    test404('get', `/api/election/${badId}/votes`, 'election');
  });

  it('should return 403 when admins try to vote', async function() {
    passportStub.login(this.adminUser);
    const { body: error } = await request(app)
      .post('/api/vote')
      .send(votePayload(this.activeAlternative.id))
      .expect(403)
      .expect('Content-Type', /json/);

    error.name.should.equal('AdminVotingError');
    error.message.should.equal("Admin users can't vote.");
    error.status.should.equal(403);
  });
});
