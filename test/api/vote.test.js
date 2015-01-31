var Bluebird = require('bluebird');
var request = require('supertest');
var passportStub = require('passport-stub');
var chai = require('chai');
var app = require('../../app');
var Alternative = require('../../app/models/alternative');
var Election = require('../../app/models/election');
var User = require('../../app/models/user');
var Vote = require('../../app/models/vote');
var should = chai.should();

describe('Vote API', function() {
    passportStub.install(app);

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
    var inactiveData = {
        description: 'inactive election alt'
    };

    var testUser = {
        username: 'testUser'
    };
    var adminUser = {
        username: 'admin',
        admin: true
    };
    var testPassword = 'password';

    function votePayload(alternativeId) {
        return {
            alternativeId: alternativeId
        };
    }

    beforeEach(function() {
        return Bluebird.all([
            Election.removeAsync({}),
            Alternative.removeAsync({}),
            User.removeAsync({}),
            Vote.removeAsync({})
        ]).bind(this)
        .then(function() {
            return Election.createAsync(activeElectionData, inactiveElectionData);
        })
        .spread(function(activeCreated, inactiveCreated) {
            this.activeElection = activeCreated;
            this.inactiveElection = inactiveCreated;

            activeData.election = this.activeElection;
            inactiveData.election = this.inactiveElection;
            this.activeAlternative = new Alternative(activeData);
            this.inactiveAlternative = new Alternative(inactiveData);

            return Bluebird.all([
                this.activeElection.addAlternative(this.activeAlternative),
                this.inactiveElection.addAlternative(this.inactiveAlternative)
            ]);
        })
        .then(function() {
            return Bluebird.all([
                User.registerAsync(testUser, testPassword),
                User.registerAsync(adminUser, testPassword)
            ]);
        })
        .spread(function(user, adminUser) {
            this.user = user;
            this.adminUser = adminUser;
            passportStub.login(user);
        });
    });

    it('should not be possible to vote with an invalid alternativeId', function(done) {
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
                vote.alternative.should.equal(this.activeAlternative.id);
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
                    .send(votePayload(this.activeAlternative.id))
                    .expect(400)
                    .expect('Content-Type', /json/)
                    .end(function(err, res) {
                        if (err) return done(err);

                        var error = res.body;
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
                error.message.should.equal('Can\'t vote on an inactive election.');
                error.status.should.equal(400);

                Vote.findAsync({ election: this.inactiveElection.id })
                    .then(function(votes) {
                        votes.length.should.equal(0, 'no vote should be added');
                        done();
                    }).catch(done);
            }.bind(this));
    });

    it('should be able to list votes', function(done) {
        passportStub.login(this.adminUser);
        return this.activeAlternative.addVote(this.user).bind(this)
            .then(function() {
                request(app)
                    .get('/api/vote/' + this.activeAlternative.id)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function(err, res) {
                        if (err) return done(err);
                        var votes = res.body;
                        votes.length.should.equal(1);
                        votes[0].alternative.should.equal(this.activeAlternative.id);
                        should.exist(votes[0].hash);

                        done();
                    }.bind(this));
            }).catch(done);
    });

    it('should only be able to list votes as admin', function(done) {
        return this.activeAlternative.addVote(this.user).bind(this)
            .then(function() {
                request(app)
                    .get('/api/vote/' + this.activeAlternative.id)
                    .expect(403)
                    .expect('Content-Type', /json/)
                    .end(function(err, res) {
                        if (err) return done(err);

                        var error = res.body;
                        error.message.should.equal('You need to be an admin to access this resource.');
                        error.status.should.equal(403);

                        done();
                    });
            }).catch(done);
    });

    it('should be possible to retrieve a vote', function(done) {
        return this.activeAlternative.addVote(this.user)
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

    it('should not be possible to retrieve others\' votes', function(done) {
        return this.activeAlternative.addVote(this.adminUser)
            .spread(function(vote) {
                request(app)
                    .get('/api/vote')
                    .set('Vote-Hash', vote.hash)
                    .expect(404)
                    .expect('Content-Type', /json/)
                    .end(function(err, res) {
                        if (err) return done(err);
                        var error = res.body;
                        error.message.should.equal('Couldn\'t find vote.');
                        error.status.should.equal(404);
                        done();
                    });
            }).catch(done);
    });
});
