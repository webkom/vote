const passportStub = require('passport-stub');
const request = require('supertest');
const ObjectId = require('mongoose').Types.ObjectId;
const chai = require('chai');
const app = require('../../app');
const Alternative = require('../../app/models/alternative');
const Election = require('../../app/models/election');
const { test404, testAdminResource } = require('./helpers');
const { createUsers } = require('../helpers');

chai.should();

describe('Alternatives API', () => {
  const testElectionData = {
    title: 'test election',
    description: 'test election description',
    active: false
  };

  const createdAlternativeData = {
    description: 'test alternative 1'
  };

  const testAlternativeData = {
    description: 'test alternative 2'
  };

  before(() => {
    passportStub.install(app);
  });

  beforeEach(function() {
    passportStub.logout();
    const election = new Election(testElectionData);

    return election
      .save()
      .bind(this)
      .then(function(createdElection) {
        this.election = createdElection;
        const alternative = new Alternative(createdAlternativeData);
        return election.addAlternative(alternative);
      })
      .then(alternative => {
        this.alternative = alternative;
        return createUsers();
      })
      .spread(function(user, adminUser) {
        this.user = user;
        this.adminUser = adminUser;
      });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall();
  });

  it('should be able to get alternatives as admin', async function() {
    passportStub.login(this.adminUser);
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

  it('should be possible to get alternatives after adding them', async function() {
    passportStub.login(this.adminUser);
    await request(app)
      .post(`/api/election/${this.election.id}/alternatives`)
      .send(testAlternativeData)
      .expect(201)
      .expect('Content-Type', /json/);

    passportStub.login(this.adminUser);
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

  it('should only be possible to get alternatives as admin', async function() {
    passportStub.login(this.user);
    await testAdminResource(
      'get',
      `/api/election/${this.election.id}/alternatives`
    );
  });

  it('should get 404 when listing alternatives for invalid electionIds', async function() {
    passportStub.login(this.adminUser);
    await test404('get', '/api/election/badid/alternatives', 'election');
  });

  it('should get 404 when listing alternatives for nonexistent electionIds', async function() {
    passportStub.login(this.adminUser);
    const badId = new ObjectId();
    await test404('get', `/api/election/${badId}/alternatives`, 'election');
  });

  it('should be able to create alternatives for deactivated elections', async function() {
    passportStub.login(this.adminUser);
    const res = await request(app)
      .post(`/api/election/${this.election.id}/alternatives`)
      .send(testAlternativeData)
      .expect(201)
      .expect('Content-Type', /json/);

    res.body.description.should.equal(testAlternativeData.description);
    res.status.should.equal(201);
  });

  it('should not be able to create alternatives for active elections', async function() {
    passportStub.login(this.adminUser);

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

  it('should return 400 when creating alternatives without required fields', async function() {
    passportStub.login(this.adminUser);
    const { body: error } = await request(app)
      .post(`/api/election/${this.election.id}/alternatives`)
      .expect(400)
      .expect('Content-Type', /json/);

    error.name.should.equal('ValidationError');
    error.status.should.equal(400);
    error.errors.description.path.should.equal('description');
    error.errors.description.kind.should.equal('required');
  });

  it('should get 404 when creating alternatives for invalid electionIds', async function() {
    passportStub.login(this.adminUser);
    await test404('post', '/api/election/badid/alternatives', 'election');
  });

  it('should get 404 when creating alternatives for nonexistent electionIds', async function() {
    passportStub.login(this.adminUser);
    const badId = new ObjectId();
    await test404('post', `/api/election/${badId}/alternatives`, 'election');
  });

  it('should only be possible to create alternatives as admin', async function() {
    passportStub.login(this.user);
    await testAdminResource(
      'post',
      `/api/election/${this.election.id}/alternatives`
    );
  });
});
