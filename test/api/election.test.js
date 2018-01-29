const passportStub = require('passport-stub');
const ObjectId = require('mongoose').Types.ObjectId;
const request = require('supertest');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const app = require('../../app');
const Election = require('../../app/models/election');
const Alternative = require('../../app/models/alternative');
const Vote = require('../../app/models/vote');
const { test404, testAdminResource } = require('./helpers');
const { createUsers } = require('../helpers');

const should = chai.should();
chai.use(sinonChai);

describe('Election API', () => {
  const activeElectionData = {
    title: 'activeElection1',
    description: 'active election 1',
    active: true
  };

  const inactiveElectionData = {
    title: 'inactiveElection1',
    description: 'inactive election 1'
  };

  const electionWithAlternative = {
    title: 'electionWithAlternative',
    description: 'alternative election',
    alternatives: [
      {
        description: 'election alternative 1'
      },
      {
        description: 'election alternative 2'
      }
    ]
  };

  const testAlternative = {
    description: 'test alternative'
  };

  const ioStub = {
    emit: sinon.stub()
  };

  before(() => {
    passportStub.install(app);
    app.set('io', ioStub);
  });

  beforeEach(async function() {
    passportStub.logout();
    ioStub.emit.reset();

    this.activeElection = await new Election(activeElectionData).save();
    testAlternative.election = this.activeElection;
    this.alternative = new Alternative(testAlternative);
    await this.activeElection.addAlternative(this.alternative);
    const [user, adminUser] = await createUsers();
    this.user = user;
    this.adminUser = adminUser;
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall();
  });

  it('should be able to create elections', async function() {
    passportStub.login(this.adminUser);
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

  it('should be able to create elections with alternatives', async function() {
    passportStub.login(this.adminUser);
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

  it('should return 400 when creating elections without required fields', async function() {
    passportStub.login(this.adminUser);
    const { body: error } = await request(app)
      .post('/api/election')
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('ValidationError');
    error.status.should.equal(400);
    error.errors.title.path.should.equal('title');
    error.errors.title.kind.should.equal('required');
  });

  it('should only be possible to create elections as admin', async function() {
    passportStub.login(this.user);
    await testAdminResource('post', '/api/election');
  });

  it('should be able to get all elections as admin', async function() {
    passportStub.login(this.adminUser);
    const { body } = await request(app)
      .get('/api/election')
      .expect(200)
      .expect('Content-Type', /json/);

    body[0].title.should.equal(
      this.activeElection.title,
      'db election title hash should be the same as api result'
    );

    body[0].description.should.equal(
      this.activeElection.description,
      'db election description hash should be the same as api result'
    );

    body[0]._id.should.equal(
      this.activeElection.id,
      'db election id hash should be the same as api result'
    );
  });

  it('should only be possible to get elections jas admin', async function() {
    passportStub.login(this.user);
    await testAdminResource('get', '/api/election');
  });

  it('should be able to get an election and its alternatives as admin', async function() {
    passportStub.login(this.adminUser);
    const { body } = await request(app)
      .get(`/api/election/${this.activeElection.id}`)
      .expect(200)
      .expect('Content-Type', /json/);

    body.title.should.equal(this.activeElection.title);
    body.description.should.equal(this.activeElection.description);
    body.active.should.equal(true);
    body.alternatives.length.should.equal(1);
    body.alternatives[0]._id.should.equal(this.alternative.id);
  });

  it('should only be possible to retrieve alternatives as admin', async function() {
    passportStub.login(this.user);
    await testAdminResource('get', `/api/election/${this.activeElection.id}`);
  });

  it('should get 404 for missing elections', async function() {
    passportStub.login(this.adminUser);
    const badId = new ObjectId();
    await test404('get', `/api/election/${badId}`, 'election');
  });

  it('should get 404 when retrieving alternatives with an invalid ObjectId', async function() {
    passportStub.login(this.adminUser);
    await test404('get', '/api/election/badelection', 'election');
  });

  it('should be able to activate an election', async function() {
    passportStub.login(this.adminUser);
    const election = await Election.create(inactiveElectionData);
    const { body } = await request(app)
      .post(`/api/election/${election.id}/activate`)
      .expect(200)
      .expect('Content-Type', /json/);

    ioStub.emit.should.have.been.calledWith('election');
    body.description.should.equal(election.description);
    body.active.should.equal(true, 'db election should be active');
  });

  it('should get 404 when activating a missing election', async function() {
    passportStub.login(this.adminUser);
    const badId = new ObjectId();
    await test404('post', `/api/election/${badId}/activate`, 'election');
  });

  it('should get 404 when activating an election with an invalid ObjectId', async function() {
    passportStub.login(this.adminUser);
    await test404('post', '/api/election/badid/activate', 'election');
  });

  it('should only be possible to activate elections as admin', async function() {
    passportStub.login(this.user);
    await testAdminResource(
      'post',
      `/api/election/${this.activeElection.id}/activate`
    );
  });

  it('should be able to deactivate an election', async function() {
    passportStub.login(this.adminUser);
    const { body } = await request(app)
      .post(`/api/election/${this.activeElection.id}/deactivate`)
      .expect(200)
      .expect('Content-Type', /json/);
    ioStub.emit.should.not.have.been.called;
    body.active.should.equal(false, 'db election should not be active');
  });

  it('should get 404 when deactivating a missing election', async function() {
    passportStub.login(this.adminUser);
    const badId = new ObjectId();
    await test404('post', `/api/election/${badId}/deactivate`, 'election');
  });

  it('should get 404 when deactivating an election with an invalid ObjectId', async function() {
    passportStub.login(this.adminUser);
    await test404('post', '/api/election/badid/deactivate', 'election');
  });

  it('should only be possible to deactivate elections as admin', async function() {
    passportStub.login(this.user);
    await testAdminResource(
      'post',
      `/api/election/${this.activeElection.id}/deactivate`
    );
  });

  it('should be possible to delete elections', async function() {
    passportStub.login(this.adminUser);

    const vote = new Vote({
      alternative: this.alternative.id,
      hash: 'thisisahash'
    });

    this.activeElection.active = false;

    await vote.save();
    await this.activeElection.save();
    const { body } = await request(app)
      .delete(`/api/election/${this.activeElection.id}`)
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

  it('should not be possible to delete active elections', async function() {
    passportStub.login(this.adminUser);
    const { body: error } = await request(app)
      .delete(`/api/election/${this.activeElection.id}`)
      .expect(400)
      .expect('Content-Type', /json/);

    error.status.should.equal(400);
    error.message.should.equal('Cannot delete an active election.');
  });

  it('should only be possible to delete elections as admin', async function() {
    passportStub.login(this.user);
    await testAdminResource('delete', '/api/election/badid');
  });

  it('should get 404 when deleting elections with invalid ObjectIds', async function() {
    passportStub.login(this.adminUser);
    await test404('delete', '/api/election/badid', 'election');
  });

  it('should get 404 when deleting elections with nonexistent ObjectIds', async function() {
    passportStub.login(this.adminUser);
    const badId = new ObjectId();
    await test404('delete', `/api/election/${badId}`, 'election');
  });

  it('should be possible to retrieve active elections', async function() {
    passportStub.login(this.user);
    const { body } = await request(app)
      .get('/api/election/active')
      .expect(200)
      .expect('Content-Type', /json/);

    body.title.should.equal(this.activeElection.title);
    body.description.should.equal(this.activeElection.description);
    body.alternatives[0].description.should.equal(this.alternative.description);
    should.not.exist(body.hasVotedUsers);
  });

  it('should filter out elections the user has voted on', async function() {
    passportStub.login(this.user);
    this.activeElection.hasVotedUsers.push({
      user: this.user.id
    });

    await this.activeElection.save();
    const { body } = await request(app)
      .get('/api/election/active')
      .expect(200)
      .expect('Content-Type', /json/);
    should.not.exist(body);
  });

  it('should be possible to list the number of users that have voted', async function() {
    passportStub.login(this.adminUser);

    await this.alternative.addVote(this.user);
    const { body } = await request(app)
      .get(`/api/election/${this.activeElection.id}/count`)
      .expect(200)
      .expect('Content-Type', /json/);

    body.users.should.equal(1);
  });

  it('should only be possible to count voted users as admin', async function() {
    passportStub.login(this.user);
    await testAdminResource(
      'get',
      `/api/election/${this.activeElection.id}/count`
    );
  });

  it('should get 404 when counting votes for elections with invalid ObjectIds', async function() {
    passportStub.login(this.adminUser);
    await test404('get', '/api/election/badid/count', 'election');
  });

  it('should get 404 when counting votes for elections with nonexistent ObjectIds', async function() {
    passportStub.login(this.adminUser);
    const badId = new ObjectId();
    await test404('get', `/api/election/${badId}/count`, 'election');
  });
});
