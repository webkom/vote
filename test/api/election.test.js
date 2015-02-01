var Bluebird = require('bluebird');
var passportStub = require('passport-stub');
var ObjectId = require('mongoose').Types.ObjectId;
var request = require('supertest');
var app = require('../../app');
var chai = require('chai');
var Election = require('../../app/models/election');
var Alternative = require('../../app/models/alternative');
var User = require('../../app/models/user');
var helpers = require('./helpers');
var testPost404 = helpers.testPost404;
var testGet404 = helpers.testGet404;
var createUsers = helpers.createUsers;
var testAdminResourcePost = helpers.testAdminResourcePost;

chai.should();

describe('Election API', function() {
    passportStub.install(app);

    var activeElectionData = {
        title: 'activeElection1',
        description: 'active election 1',
        active: true
    };

    var inactiveElectionData = {
        title: 'inactiveElection1',
        description: 'inactive election 1'
    };

    var testAlternative = {
        description: 'test alternative'
    };

    beforeEach(function() {
        passportStub.logout();

        return Bluebird.all([
            Election.removeAsync({}),
            Alternative.removeAsync({}),
            User.removeAsync({})
        ]).bind(this)
        .then(function() {
            var election = new Election(activeElectionData);
            return election.saveAsync();
        })
        .spread(function(election) {
            this.activeElection = election;
            testAlternative.election = election;
            this.alternative = new Alternative(testAlternative);
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

    it('should be able to create elections', function(done) {
        passportStub.login(this.adminUser);
        request(app)
            .post('/api/election')
            .send(inactiveElectionData)
            .expect(201)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.title.should.equal(inactiveElectionData.title, 'db election title hash should be the same as api result');
                res.body.description.should.equal(inactiveElectionData.description, 'db election description hash should be the same as api result');
                res.body.active.should.equal(false, 'db election should not be active');
                done();
            });
    });

    it('should only be possible to create elections as admin', function(done) {
        passportStub.login(this.user);
        testAdminResourcePost('/api/election', done);
    });

    it('should be able to get all elections', function(done) {
        request(app)
            .get('/api/election')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                res.body[0].title.should.equal(this.activeElection.title, 'db election title hash should be the same as api result');
                res.body[0].description.should.equal(this.activeElection.description, 'db election description hash should be the same as api result');
                res.body[0]._id.should.equal(this.activeElection.id, 'db election id hash should be the same as api result');
                done();
            }.bind(this));
    });

    it('should be able to get an election and its alternatives', function(done) {
        request(app)
            .get('/api/election/' + this.activeElection.id)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.title.should.equal(this.activeElection.title, 'db election title hash should be the same as api result');
                res.body.description.should.equal(this.activeElection.description, 'db election description hash should be the same as api result');
                res.body.active.should.equal(true, 'db election should not be active');
                res.body.alternatives.length.should.equal(1);
                res.body.alternatives[0]._id.should.equal(this.alternative.id, 'should be the correct alternative');
                done();
            }.bind(this));
    });

    it('should get 404 for missing elections', function(done) {
        var badId = new ObjectId();
        testGet404('/api/election/' + badId, 'election', done);
    });

    it('should get 404 when retrieving alternatives with an invalid ObjectId', function(done) {
        testGet404('/api/election/badelection', 'election', done);
    });

    it('should be able to activate an election', function(done) {
        passportStub.login(this.adminUser);
        Election.createAsync(inactiveElectionData)
            .then(function(election) {
                request(app)
                    .post('/api/election/' + election.id + '/activate')
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.body.description.should.equal(election.description);
                        res.body.active.should.equal(true, 'db election should be active');
                        done();
                    });
            });
    });

    it('should get 404 when activating a missing election', function(done) {
        passportStub.login(this.adminUser);
        var badId = new ObjectId();
        testPost404('/api/election/' + badId + '/activate', 'election', done);
    });

    it('should get 404 when activating an election with an invalid ObjectId', function(done) {
        passportStub.login(this.adminUser);
        testPost404('/api/election/badid/activate', 'election', done);
    });

    it('should only be possible to activate elections as admin', function(done) {
        passportStub.login(this.user);
        testAdminResourcePost('/api/election/' + this.activeElection.id + '/activate', done);
    });

    it('should be able to deactivate an election', function(done) {
        passportStub.login(this.adminUser);
        request(app)
            .post('/api/election/' + this.activeElection.id + '/deactivate')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.active.should.equal(false, 'db election should not be active');
                done();
            });
    });

    it('should get 404 when deactivating a missing election', function(done) {
        passportStub.login(this.adminUser);
        var badId = new ObjectId();
        testPost404('/api/election/' + badId + '/deactivate', 'election', done);
    });

    it('should get 404 when deactivating an election with an invalid ObjectId', function(done) {
        passportStub.login(this.adminUser);
        testPost404('/api/election/badid/deactivate', 'election', done);
    });

    it('should only be possible to deactivate elections as admin', function(done) {
        passportStub.login(this.user);
        testAdminResourcePost('/api/election/' + this.activeElection.id + '/deactivate', done);
    });

});
