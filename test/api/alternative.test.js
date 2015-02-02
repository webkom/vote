var Bluebird = require('bluebird');
var passportStub = require('passport-stub');
var request = require('supertest');
var ObjectId = require('mongoose').Types.ObjectId;
var chai = require('chai');
var app = require('../../app');
var Alternative = require('../../app/models/alternative');
var Election = require('../../app/models/election');
var User = require('../../app/models/user');
var Vote = require('../../app/models/vote');
var helpers = require('./helpers');
var testGet404 = helpers.testGet404;
var testPost404 = helpers.testPost404;
var testDelete404 = helpers.testDelete404;
var testAdminResourcePost = helpers.testAdminResourcePost;
var testAdminResourceDelete = helpers.testAdminResourceDelete;
var createUsers = helpers.createUsers;
chai.should();

describe('Alternatives API', function() {
    var testElectionData = {
        title: 'test election',
        description: 'test election description',
        active: true
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
        return Bluebird.all([
            Election.removeAsync({}),
            Alternative.removeAsync({}),
            User.removeAsync({}),
            Vote.removeAsync({})
        ]).bind(this)
        .then(function() {
            var election = new Election(testElectionData);
            return election.saveAsync();
        })
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

    it('should be able to get alternatives', function(done) {
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

    it('should get 404 when listing alternatives for invalid electionIds', function(done) {
        testGet404('/api/election/badid/alternatives', 'election', done);
    });

    it('should get 404 when listing alternatives for nonexistent electionIds', function(done) {
        var badId = new ObjectId();
        testGet404('/api/election/' + badId + '/alternatives', 'election', done);
    });

    it('should be able to create alternatives', function(done) {
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

    it('should get 404 when creating alternatives for invalid electionIds', function(done) {
        passportStub.login(this.adminUser);
        testPost404('/api/election/badid/alternatives', 'election', done);
    });

    it('should get 404 when creating alternatives for nonexistent electionIds', function(done) {
        passportStub.login(this.adminUser);
        var badId = new ObjectId();
        testPost404('/api/election/' + badId + '/alternatives', 'election', done);
    });

    it('should only be possible to create alternatives as admin', function(done) {
        passportStub.login(this.user);
        testAdminResourcePost('/api/election/' + this.election.id + '/alternatives', done);
    });

    it('should be possible to delete alternatives', function(done) {
        passportStub.login(this.adminUser);

        var vote = new Vote({
            alternative: this.alternative.id,
            hash: 'thisisahash'
        });

        this.election.active = false;

        return Bluebird.all([
            vote.saveAsync(),
            this.election.saveAsync()
        ]).bind(this).then(function() {
            request(app)
                .delete('/api/election/' + this.election.id + '/alternatives/' + this.alternative.id)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err) return done(err);
                    res.body.message.should.equal('Alternative deleted.');
                    res.body.status.should.equal(200);
                    return Bluebird.all([
                        Election.findAsync({}),
                        Alternative.findAsync({}),
                        Vote.findAsync({})
                    ]).spread(function(elections, alternatives, votes) {
                        elections.length.should.equal(1, 'election should not be deleted');
                        alternatives.length.should.equal(0);
                        votes.length.should.equal(0);
                    }).nodeify(done);
                });
        }).catch(done);
    });

    it('should not be possible to delete alternatives for active elections', function(done) {
        passportStub.login(this.adminUser);
        request(app)
            .delete('/api/election/' + this.election.id + '/alternatives/' + this.alternative.id)
            .expect(400)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                var error = res.body;
                error.status.should.equal(400);
                error.message.should.equal('Cannot delete alternatives belonging to an active election.');
                done();
            });
    });

    it('should only be possible to delete elections as admin', function(done) {
        passportStub.login(this.user);
        testAdminResourceDelete('/api/election/' + this.election.id + '/alternatives/' + this.alternative.id, done);
    });

    it('should get 404 when deleting alternatives with invalid ObjectIds', function(done) {
        passportStub.login(this.adminUser);
        this.election.active = false;
        return this.election.saveAsync().bind(this)
            .then(function() {
                testDelete404('/api/election/' + this.election.id + '/alternatives/badid', 'alternative', done);
            }).catch(done);
    });

    it('should get 404 when deleting alternatives with nonexistent ObjectIds', function(done) {
        passportStub.login(this.adminUser);
        var badId = new ObjectId();
        this.election.active = false;
        return this.election.saveAsync().bind(this)
            .then(function() {
                testDelete404('/api/election/' + this.election.id + '/alternatives/' + badId, 'alternative', done);
            }).catch(done);
    });

});
