var Bluebird = require('bluebird');
var request = require('supertest');
var chai = require('chai');
var app = require('../../app');
var Election = require('../../app/models/election');
var Alternative = require('../../app/models/alternative');

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
            .end(function(err, res) {
                if (err) return done(err);
                res.body.length.should.equal(1);
                res.body[0].description.should.equal(this.alternative.description, 'should be the same as api result');
                done();
            }.bind(this));
    });

    it('should be able to create alternatives', function(done) {
        request(app)
            .post('/api/election/' + this.election.id + '/alternatives')
            .send(testAlternativeData)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.description.should.equal(testAlternativeData.description);
                res.status.should.equal(201);
                done();
            });
    });

});
