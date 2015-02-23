/* jshint expr: true */
var Bluebird = require('bluebird');
var passportStub = require('passport-stub');
var ObjectId = require('mongoose').Types.ObjectId;
var request = require('supertest');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var app = require('../../app');
var Election = require('../../app/models/election');
var Alternative = require('../../app/models/alternative');
var Vote = require('../../app/models/vote');
var helpers = require('./helpers');

var testPost404 = helpers.testPost404;
var testGet404 = helpers.testGet404;
var testDelete404 = helpers.testDelete404;
var createUsers = helpers.createUsers;
var testAdminResourceGet = helpers.testAdminResourceGet;
var testAdminResourcePost = helpers.testAdminResourcePost;
var testAdminResourceDelete = helpers.testAdminResourceDelete;
var should = chai.should();

chai.use(sinonChai);

describe('Election API', function() {
    var activeElectionData = {
        title: 'activeElection1',
        description: 'active election 1',
        active: true
    };

    var inactiveElectionData = {
        title: 'inactiveElection1',
        description: 'inactive election 1'
    };

    var electionWithAlternative = {
        title: 'electionWithAlternative',
        description: 'alternative election',
        alternatives:[
            {
                description: 'election alternative 1'
            },
            {
                description: 'election alternative 2'
            }
        ]
    };

    var testAlternative = {
        description: 'test alternative'
    };

    var ioStub = {
        emit: sinon.stub()
    };

    before(function() {
        passportStub.install(app);
        app.set('io', ioStub);
    });

    beforeEach(function() {
        passportStub.logout();
        ioStub.emit.reset();

        var election = new Election(activeElectionData);
        return election.saveAsync().bind(this)
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

    after(function() {
        passportStub.logout();
        passportStub.uninstall();
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
                res.body.hasVotedUsers.should.be.an.instanceof(Array);
                done();
            });
    });

    it('should be able to create elections with alternatives', function(done) {
        passportStub.login(this.adminUser);
        request(app)
            .post('/api/election')
            .send(electionWithAlternative)
            .expect(201)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.title.should.equal(electionWithAlternative.title, 'db election title hash should be the same as api result');
                res.body.description.should.equal(electionWithAlternative.description, 'db election description hash should be the same as api result');
                res.body.active.should.equal(false, 'db election should not be active');
                res.body.alternatives.length.should.not.equal(0, 'db election should contain alternatives');
                res.body.alternatives[0].description.should.equal(electionWithAlternative.alternatives[0].description, 'db election alternative should be correct');
                res.body.alternatives[1].description.should.equal(electionWithAlternative.alternatives[1].description, 'db election alternative should be correct');
                done();
            });
    });

    it('should return 400 when creating elections without required fields', function(done) {
        passportStub.login(this.adminUser);
        request(app)
            .post('/api/election')
            .expect(400)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                var error = res.body;
                error.name.should.equal('ValidationError');
                error.status.should.equal(400);
                error.errors.title.path.should.equal('title');
                error.errors.title.type.should.equal('required');
                done();
            });
    });

    it('should only be possible to create elections as admin', function(done) {
        passportStub.login(this.user);
        testAdminResourcePost('/api/election', done);
    });

    it('should be able to get all elections as admin', function(done) {
        passportStub.login(this.adminUser);
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

    it('should only be possible to get elections jas admin', function(done) {
        passportStub.login(this.user);
        testAdminResourceGet('/api/election', done);
    });

    it('should be able to get an election and its alternatives as admin', function(done) {
        passportStub.login(this.adminUser);
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

    it('should only be possible to retrieve alternatives as admin', function(done) {
        passportStub.login(this.user);
        testAdminResourceGet('/api/election/' + this.activeElection.id, done);
    });

    it('should get 404 for missing elections', function(done) {
        passportStub.login(this.adminUser);
        var badId = new ObjectId();
        testGet404('/api/election/' + badId, 'election', done);
    });

    it('should get 404 when retrieving alternatives with an invalid ObjectId', function(done) {
        passportStub.login(this.adminUser);
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
                        ioStub.emit.should.have.been.calledWith('election');
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
                ioStub.emit.should.not.have.been.called;
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

    it('should be possible to delete elections', function(done) {
        passportStub.login(this.adminUser);

        var vote = new Vote({
            alternative: this.alternative.id,
            hash: 'thisisahash'
        });

        this.activeElection.active = false;

        return Bluebird.all([
            vote.saveAsync(),
            this.activeElection.saveAsync()
        ]).bind(this).then(function() {
                request(app)
                    .delete('/api/election/' + this.activeElection.id)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.body.message.should.equal('Election deleted.');
                        res.body.status.should.equal(200);
                        return Bluebird.all([
                            Election.findAsync({}),
                            Alternative.findAsync({}),
                            Vote.findAsync({})
                        ]).spread(function(elections, alternatives, votes) {
                            elections.length.should.equal(0);
                            alternatives.length.should.equal(0);
                            votes.length.should.equal(0);
                        }).nodeify(done);
                    });
            }).catch(done);
    });

    it('should not be possible to delete active elections', function(done) {
        passportStub.login(this.adminUser);
        request(app)
            .delete('/api/election/' + this.activeElection.id)
            .expect(400)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                var error = res.body;
                error.status.should.equal(400);
                error.message.should.equal('Cannot delete an active election.');
                done();
            });
    });

    it('should only be possible to delete elections as admin', function(done) {
        passportStub.login(this.user);
        testAdminResourceDelete('/api/election/badid', done);
    });

    it('should get 404 when deleting elections with invalid ObjectIds', function(done) {
        passportStub.login(this.adminUser);
        testDelete404('/api/election/badid', 'election', done);
    });

    it('should get 404 when deleting elections with nonexistent ObjectIds', function(done) {
        passportStub.login(this.adminUser);
        var badId = new ObjectId();
        testDelete404('/api/election/' + badId, 'election', done);
    });

    it('should be possible to retrieve active elections', function(done) {
        passportStub.login(this.user);
        request(app)
            .get('/api/election/active')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                var election = res.body;
                election.title.should.equal(this.activeElection.title);
                election.description.should.equal(this.activeElection.description);
                election.alternatives[0].description.should.equal(this.alternative.description);
                should.not.exist(election.hasVotedUsers);
                done();
            }.bind(this));
    });

    it('should filter out elections the user has voted on', function(done) {
        passportStub.login(this.user);
        this.activeElection.hasVotedUsers.push({
            user: this.user.id
        });

        this.activeElection.saveAsync()
            .then(function() {
                request(app)
                    .get('/api/election/active')
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.body.should.be.empty;
                        done();
                    });
            });
    });

    it('should be possible to list the number of users that have voted', function(done) {
        passportStub.login(this.adminUser);

        this.alternative.addVote(this.user).bind(this)
            .then(function() {
                request(app)
                    .get('/api/election/' + this.activeElection.id + '/count')
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function(err, res) {
                        if (err) return done(err);
                        var count = res.body.users;
                        count.should.equal(1);
                        done();
                    });
            }).catch(done);
    });

    it('should only be possible to count voted users as admin', function(done) {
        passportStub.login(this.user);
        testAdminResourceGet('/api/election/' + this.activeElection.id + '/count', done);
    });

    it('should get 404 when counting votes for elections with invalid ObjectIds', function(done) {
        passportStub.login(this.adminUser);
        testGet404('/api/election/badid/count', 'election', done);
    });

    it('should get 404 when counting votes for elections with nonexistent ObjectIds', function(done) {
        passportStub.login(this.adminUser);
        var badId = new ObjectId();
        testGet404('/api/election/' + badId + '/count', 'election', done);
    });
});
