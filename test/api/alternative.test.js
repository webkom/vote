var request = require('supertest');
var chai = require('chai');
var app = require('../../app');
var Election = require('../../app/models/election');
var Alternative = require('../../app/models/alternative');

chai.should();

describe('Alternatives API', function() {
    var testElection = new Election({
        title:        'test election',
        description:  'test election description'
    });

    var testAlternative = new Alternative({
        description: 'test alternative 1'
    });

    var testAlternative2 = new Alternative({
        description: 'test alternative 2'
    });


    before(function(done) {
        Alternative.remove({}, function() {
            Election.remove({}, function() {
                testElection.addAlternative(testAlternative, done);
            });
        });

    });
    after(function(done) {
        Alternative.remove({}, function() {
            Election.remove({}, done);
        });
    });

    it('should be able to create and get alternatives', function(done) {
        request(app)
            .post('/api/election/' + testElection._id + '/alternatives')
            .send(testAlternative2)
            .end(function(err, res) {
                if (err) done(err);
                res.status.should.equal(201);
                request(app)
                    .get('/api/election/' + testElection._id + '/alternatives')
                    .end(function(err, res) {
                        if (err) done(err);
                        res.body[0].description.should.equal(testAlternative.description, 'should be the same as api result');
                        res.body[1].description.should.equal(testAlternative2.description, 'should be the same as api result');
                        done();
                    });
            });
    });
});
