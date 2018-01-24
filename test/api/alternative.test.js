const passportStub = require('passport-stub');
const request = require('supertest');
const ObjectId = require('mongoose').Types.ObjectId;
const chai = require('chai');
const app = require('../../app');
const Alternative = require('../../app/models/alternative');
const Election = require('../../app/models/election');
const helpers = require('./helpers');
const test404 = helpers.test404;
const testAdminResource = helpers.testAdminResource;
const createUsers = helpers.createUsers;
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
        createdAlternativeData.election = createdElection.id;
        this.alternative = new Alternative(createdAlternativeData);
        return election.addAlternative(this.alternative);
      })
      .then(() => createUsers())
      .spread(function(user, adminUser) {
        this.user = user;
        this.adminUser = adminUser;
      });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall();
  });

  it('should be able to get alternatives as admin', function(done) {
    passportStub.login(this.adminUser);
    request(app)
      .get(`/api/election/${this.election.id}/alternatives`)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        res.body.length.should.equal(1);
        res.body[0].description.should.equal(
          this.alternative.description,
          'should be the same as api result'
        );
        done();
      });
  });

  it('should only be possible to get alternatives as admin', function(done) {
    passportStub.login(this.user);
    testAdminResource(
      'get',
      `/api/election/${this.election.id}/alternatives`,
      done
    );
  });

  it('should get 404 when listing alternatives for invalid electionIds', function(done) {
    passportStub.login(this.adminUser);
    test404('get', '/api/election/badid/alternatives', 'election', done);
  });

  it('should get 404 when listing alternatives for nonexistent electionIds', function(done) {
    passportStub.login(this.adminUser);
    const badId = new ObjectId();
    test404('get', `/api/election/${badId}/alternatives`, 'election', done);
  });

  it('should be able to create alternatives for deactivated elections', function(done) {
    passportStub.login(this.adminUser);
    request(app)
      .post(`/api/election/${this.election.id}/alternatives`)
      .send(testAlternativeData)
      .expect(201)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        res.body.description.should.equal(testAlternativeData.description);
        res.status.should.equal(201);
        done();
      });
  });

  it('should not be able to create alternatives for active elections', function(done) {
    passportStub.login(this.adminUser);

    this.election.active = true;

    this.election
      .save()
      .bind(this)
      .then(function() {
        request(app)
          .post(`/api/election/${this.election.id}/alternatives`)
          .send(testAlternativeData)
          .expect(400)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            if (err) return done(err);
            const error = res.body;
            error.name.should.equal('ActiveElectionError');
            error.message.should.equal(
              'Cannot create alternatives for active elections.'
            );
            error.status.should.equal(400);
            done();
          });
      })
      .catch(done);
  });

  it('should return 400 when creating alternatives without required fields', function(done) {
    passportStub.login(this.adminUser);
    request(app)
      .post(`/api/election/${this.election.id}/alternatives`)
      .expect(400)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        const error = res.body;
        error.name.should.equal('ValidationError');
        error.status.should.equal(400);
        error.errors.description.path.should.equal('description');
        error.errors.description.kind.should.equal('required');
        done();
      });
  });

  it('should get 404 when creating alternatives for invalid electionIds', function(done) {
    passportStub.login(this.adminUser);
    test404('post', '/api/election/badid/alternatives', 'election', done);
  });

  it('should get 404 when creating alternatives for nonexistent electionIds', function(done) {
    passportStub.login(this.adminUser);
    const badId = new ObjectId();
    test404('post', `/api/election/${badId}/alternatives`, 'election', done);
  });

  it('should only be possible to create alternatives as admin', function(done) {
    passportStub.login(this.user);
    testAdminResource(
      'post',
      `/api/election/${this.election.id}/alternatives`,
      done
    );
  });
});
