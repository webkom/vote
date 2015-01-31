var Bluebird = require('bluebird');
var request = require('supertest');
var ObjectId = require('mongoose').Types.ObjectId;
var chai = require('chai');
var app = require('../../app');
var Election = require('../../app/models/election');
var Alternative = require('../../app/models/alternative');
var helpers = require('./helpers');
var testGet404 = helpers.testGet404;
var testPost404 = helpers.testPost404;

chai.should();

describe('Alternatives API', function() {
    var testElectionData = {
        title: 'test election',
        description: 'test election description'
    };

    var createdAlternativeData = {
        description: 'test alternative 1'
    };

    var testAlternativeData = {
        description: 'test alternative 2'
    };

    beforeEach(function() {
        return Bluebird.all([
            Election.removeAsync({}),
            Alternative.removeAsync({})
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
        });
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
        testPost404('/api/election/badid/alternatives', 'election', done);
    });

    it('should get 404 when creating alternatives for nonexistent electionIds', function(done) {
        var badId = new ObjectId();
        testPost404('/api/election/' + badId + '/alternatives', 'election', done);
    });
});
