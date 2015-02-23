var Bluebird = require('bluebird');
var ObjectId = require('mongoose').Types.ObjectId;
var request = require('supertest');
var passportStub = require('passport-stub');
var chai = require('chai');
var app = require('../../app');
var Alternative = require('../../app/models/alternative');
var Election = require('../../app/models/election');
var Vote = require('../../app/models/vote');
var helpers = require('./helpers');
var testGet404 = helpers.testGet404;
var testAdminResourceGet = helpers.testAdminResourceGet;
var createUsers = helpers.createUsers;
var should = chai.should();

describe('Vote API', function() {
    var activeElectionData = {
        title: 'activeElection',
        description: 'test election',
        active: true
    };
    var inactiveElectionData = {
        title: 'inactiveElection',
        description: 'inactive election'
    };
    var activeData = {
        description: 'active election alt'
    };
    var otherActiveData = {
        description: 'other active election alt'
    };
    var inactiveData = {
        description: 'inactive election alt'
    };

    function votePayload(alternativeId) {
        return {
            alternativeId: alternativeId
        };
    }

    before(function() {
        passportStub.install(app);
    });

    beforeEach(function() {
        return Election.createAsync(activeElectionData, inactiveElectionData).bind(this)
            .spread(function(activeCreated, inactiveCreated) {
                this.activeElection = activeCreated;
                this.inactiveElection = inactiveCreated;

                activeData.election = this.activeElection;
                inactiveData.election = this.inactiveElection;
                this.activeAlternative = new Alternative(activeData);
                this.otherActiveAlternative = new Alternative(otherActiveData);
                this.inactiveAlternative = new Alternative(inactiveData);

                return Bluebird.all([
                    this.activeElection.addAlternative(this.activeAlternative),
                    this.inactiveElection.addAlternative(this.inactiveAlternative)
                ]);
            })
            .then(function() {
                return this.activeElection.addAlternative(this.otherActiveAlternative);
            })
            .then(function() {
                return createUsers();
            })
            .spread(function(user, adminUser) {
                this.user = user;
                this.adminUser = adminUser;
                passportStub.login(user);
            });
    });

    after(function() {
        passportStub.logout();
        passportStub.uninstall();
    });

    it('should not be possible to vote with an invalid ObjectId as alternativeId', function(done) {
        request(app)
            .post('/api/vote')
            .send(votePayload('bad alternative'))
            .expect(404)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                var error = res.body;
                error.status.should.equal(404);
                error.message.should.equal('Couldn\'t find alternative.');
                done();
            });
    });

    it('should not be possible to vote with a nonexistent alternativeId', function(done) {
        request(app)
            .post('/api/vote')
            .send(votePayload(new ObjectId()))
            .expect(404)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                var error = res.body;
                error.status.should.equal(404);
                error.message.should.equal('Couldn\'t find alternative.');
                done();
            });
    });

    it('should not be possible to vote without an alternativeId in the payload', function(done) {
        request(app)
            .post('/api/vote')
            .expect(400)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                var error = res.body;
                error.status.should.equal(400);
                error.message.should.equal('Missing property alternativeId from payload.');
                done();
            });
    });

    it('should be able to vote on alternative', function(done) {
        request(app)
            .post('/api/vote')
            .send(votePayload(this.activeAlternative.id))
            .expect(201)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);

                var vote = res.body;
                vote.alternative.description.should.equal(this.activeAlternative.description);
                should.exist(vote.hash);

                Vote.findAsync({ alternative: this.activeAlternative.id })
                    .then(function(votes) {
                        votes.length.should.equal(1);
                        done();
                    }).catch(done);
            }.bind(this));
    });

    it('should be able to vote only once', function(done) {
        this.activeAlternative.addVote(this.user).bind(this)
            .then(function() {
                request(app)
                    .post('/api/vote')
                    .send(votePayload(this.otherActiveAlternative.id))
                    .expect(400)
                    .expect('Content-Type', /json/)
                    .end(function(err, res) {
                        if (err) return done(err);

                        var error = res.body;
                        error.name.should.equal('AlreadyVotedError');
                        error.message.should.equal('You can only vote once per election.');
                        error.status.should.equal(400);

                        Vote.findAsync({ alternative: this.activeAlternative.id })
                            .then(function(votes) {
                                votes.length.should.equal(1);
                                done();
                            }).catch(done);
                    }.bind(this));
            });
    });

    it('should not be possible to vote without logging in', function(done) {
        passportStub.logout();
        request(app)
            .post('/api/vote')
            .send(votePayload(this.activeAlternative.id))
            .expect(401)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);

                var error = res.body;
                error.status.should.equal(401);
                error.message.should.equal('You need to be logged in to access this resource.');
                done();
            });
    });

    it('should not be able to vote with inactive user', function(done) {
        this.user.active = false;
        this.user.saveAsync().bind(this)
            .then(function() {
                request(app)
                    .post('/api/vote')
                    .send(votePayload(this.activeAlternative.id))
                    .expect(403)
                    .expect('Content-Type', /json/)
                    .end(function(err, res) {
                        if (err) return done(err);

                        var error = res.body;
                        error.message.should.equal('Can\'t vote with an inactive user: ' + this.user.username);
                        error.status.should.equal(403);

                        Vote.findAsync({ alternative: this.activeAlternative.id })
                            .then(function(votes) {
                                votes.length.should.equal(0, 'no vote should be added');
                                done();
                            }).catch(done);
                    }.bind(this));
            });
    });

    it('should not be able to vote on a deactivated election', function(done) {
        request(app)
            .post('/api/vote')
            .send(votePayload(this.inactiveAlternative.id))
            .expect(400)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);

                var error = res.body;
                error.name.should.equal('InactiveElectionError');
                error.message.should.equal('Can\'t vote on an inactive election.');
                error.status.should.equal(400);

                return Vote.findAsync({ election: this.inactiveElection.id })
                    .then(function(votes) {
                        votes.length.should.equal(0, 'no vote should be added');
                    }).nodeify(done);
            }.bind(this));
    });

    it('should be possible to retrieve a vote', function(done) {
        return this.activeAlternative.addVote(this.user).bind(this)
            .spread(function(vote) {
                request(app)
                    .get('/api/vote')
                    .set('Vote-Hash', vote.hash)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function(err, res) {
                        if (err) return done(err);

                        var receivedVote = res.body;
                        receivedVote.alternative.should.equal(String(vote.alternative));
                        receivedVote.hash.should.equal(vote.hash);
                        done();
                    });
            }).catch(done);
    });

    it('should return 400 when retrieving votes without header', function(done) {
        request(app)
            .get('/api/vote')
            .expect(400)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                var error = res.body;
                error.message.should.equal('Missing header Vote-Hash.');
                error.status.should.equal(400);
                done();
            });
    });

    it('should be possible to sum votes', function(done) {
        passportStub.login(this.adminUser);

        return this.otherActiveAlternative.addVote(this.user).bind(this)
            .then(function() {
                request(app)
                    .get('/api/election/' + this.inactiveElection.id + '/votes')
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function(err, res) {
                        if (err) return done(err);
                        var alternatives = res.body;
                        alternatives.length.should.equal(1);
                        alternatives[0].votes.should.equal(0);
                        done();
                    });
            }).catch(done);
    });

    it('should not be possible to get votes on an active election', function(done) {
        passportStub.login(this.adminUser);

        request(app)
            .get('/api/election/' + this.activeElection.id + '/votes')
            .expect(400)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.message.should.equal('Cannot retreive results on an active election.');
                done();
            });
    });

    it('should not be possible to sum votes without being admin', function(done) {
        passportStub.login(this.user);
        testAdminResourceGet('/api/election/' + this.activeElection.id + '/votes', done);
    });

    it('should get 404 when summing votes for invalid electionIds', function(done) {
        passportStub.login(this.adminUser);
        testGet404('/api/election/badid/votes', 'election', done);
    });

    it('should get 404 when summing votes for nonexistent electionIds', function(done) {
        passportStub.login(this.adminUser);
        var badId = new ObjectId();
        testGet404('/api/election/' + badId + '/votes', 'election', done);
    });

    it('should return 403 when admins try to vote', function(done) {
        passportStub.login(this.adminUser);
        request(app)
            .post('/api/vote')
            .send(votePayload(this.activeAlternative.id))
            .expect(403)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                var error = res.body;
                error.name.should.equal('AdminVotingError');
                error.message.should.equal('Admin users can\'t vote.');
                error.status.should.equal(403);
                done();
            });
    });
});
