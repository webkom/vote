var passportStub = require('passport-stub');
var request = require('supertest');
var ObjectId = require('mongoose').Types.ObjectId;
var chai = require('chai');
var app = require('../../app');
var Alternative = require('../../app/models/alternative');
var Election = require('../../app/models/election');
var helpers = require('./helpers');
var test404 = helpers.test404;
var testAdminResource = helpers.testAdminResource;
var createUsers = helpers.createUsers;
chai.should();

describe('Alternatives API', function() {
    var testElectionData = {
        title: 'test election',
        description: 'test election description',
        active: false
    };

    var createdAlternativeData = {
        description: 'test alternative 1'
    };

    var testAlternativeData = {
        description: 'test alternative 2'
    };

    before(function() {
        passportStub.install(app);
    });

    beforeEach(function() {
        passportStub.logout();
        var election = new Election(testElectionData);

        return election.saveAsync().bind(this)
            .spread(function(election) {
                this.election = election;
                createdAlternativeData.election = election.id;
                this.alternative = new Alternative(createdAlternativeData);
                return election.addAlternative(this.alternative);
            })
            .then(function() {
                return createUsers();
            })
            .spread(function(user, adminUser) {
                this.user = user;
                this.adminUser = adminUser;
            });
    });

    after(function() {
        passportStub.logout();
        passportStub.uninstall();
    });

    it('should be able to get alternatives as admin', function(done) {
        passportStub.login(this.adminUser);
        request(app)
            .get('/api/election/' + this.election.id + '/alternatives')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.length.should.equal(1);
                res.body[0].description.should.equal(this.alternative.description, 'should be the same as api result');
                done();
            }.bind(this));
    });

    it('should only be possible to get alternatives as admin', function(done) {
        passportStub.login(this.user);
        testAdminResource('get', '/api/election/' + this.election.id + '/alternatives', done);
    });

    it('should get 404 when listing alternatives for invalid electionIds', function(done) {
        passportStub.login(this.adminUser);
        test404('get', '/api/election/badid/alternatives', 'election', done);
    });

    it('should get 404 when listing alternatives for nonexistent electionIds', function(done) {
        passportStub.login(this.adminUser);
        var badId = new ObjectId();
        test404('get', '/api/election/' + badId + '/alternatives', 'election', done);
    });

    it('should be able to create alternatives for deactivated elections', function(done) {
        passportStub.login(this.adminUser);
        request(app)
            .post('/api/election/' + this.election.id + '/alternatives')
            .send(testAlternativeData)
            .expect(201)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.description.should.equal(testAlternativeData.description);
                res.status.should.equal(201);
                done();
            });
    });

    it('should not be able to create alternatives for active elections', function(done) {
        passportStub.login(this.adminUser);

        this.election.active = true;

        return this.election.saveAsync().bind(this)
            .then(function() {
                request(app)
                    .post('/api/election/' + this.election.id + '/alternatives')
                    .send(testAlternativeData)
                    .expect(400)
                    .expect('Content-Type', /json/)
                    .end(function(err, res) {
                        if (err) return done(err);
                        var error = res.body;
                        error.name.should.equal('ActiveElectionError');
                        error.message.should.equal('Cannot create alternatives for active elections.');
                        error.status.should.equal(400);
                        done();
                    });
            }).catch(done);
    });

    it('should return 400 when creating alternatives without required fields', function(done) {
        passportStub.login(this.adminUser);
        request(app)
            .post('/api/election/' + this.election.id + '/alternatives')
            .expect(400)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                var error = res.body;
                error.name.should.equal('ValidationError');
                error.status.should.equal(400);
                error.errors.description.path.should.equal('description');
                error.errors.description.type.should.equal('required');
                done();
            });
    });

    it('should get 404 when creating alternatives for invalid electionIds', function(done) {
        passportStub.login(this.adminUser);
        test404('post', '/api/election/badid/alternatives', 'election', done);
    });

    it('should get 404 when creating alternatives for nonexistent electionIds', function(done) {
        passportStub.login(this.adminUser);
        var badId = new ObjectId();
        test404('post', '/api/election/' + badId + '/alternatives', 'election', done);
    });

    it('should only be possible to create alternatives as admin', function(done) {
        passportStub.login(this.user);
        testAdminResource('post', '/api/election/' + this.election.id + '/alternatives', done);
    });
});
