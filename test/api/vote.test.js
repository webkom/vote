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
        username: 'testUser',
        password: 'password'
    };

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
            return User.registerAsync(testUser, testUser.password);
        })
        .then(function(user) {
            this.user = user;
            passportStub.login(user);
        });
    });

    it('should be able to vote on alternative', function(done) {
        request(app)
            .post('/api/vote/' + this.activeAlternative.id)
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
        this.activeAlternative.addVote(this.user.username).bind(this)
            .then(function() {
                request(app)
                    .post('/api/vote/' + this.activeAlternative.id)
                    .end(function(err, res) {
                        if (err) return done(err);
                        Vote.findAsync({ alternative: this.activeAlternative.id })
                            .then(function(votes) {
                                votes.length.should.equal(1);
                                done();
                            }).catch(done);
                    }.bind(this));
            });
    });

    it('should not be able to vote with inactive user', function(done) {
        this.user.active = false;
        this.user.saveAsync().bind(this)
            .then(function() {
                request(app)
                    .post('/api/vote/' + this.activeAlternative.id)
                    .end(function(err, res) {
                        if (err) return done(err);

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
            .post('/api/vote/' + this.inactiveAlternative.id)
            .end(function(err, res) {
                if (err) return done(err);
                Vote.findAsync({ election: this.inactiveElection.id })
                    .then(function(votes) {
                        votes.length.should.equal(0, 'no vote should be added');
                        done();
                    }).catch(done);
            }.bind(this));
    });

    it('should be able to list votes for an alternative', function(done) {
        this.activeAlternative.addVote(this.user.username).bind(this)
            .then(function() {
                request(app)
                    .get('/api/vote/' + this.activeAlternative.id)
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
});
