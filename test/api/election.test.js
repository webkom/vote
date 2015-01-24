var request = require('supertest');
var app = require('../../app');
var chai = require('chai');
var Election = require('../../app/models/election');
var Alternative = require('../../app/models/alternative');

chai.should();

describe('Election API', function() {
    var testElection = new Election({
        title:        'asdadasd',
        description:  'asdsadadasd'
    });
    var testElection2 = new Election({
        title:        'asdadasd2sd',
        description:  'asdsadsd23adasd'
    });

    var testAlternative = new Alternative({
        description: 'aaaaaaasss'
    });


    before(function(done) {
        Alternative.remove({}, function() {
            Election.remove({}, function() {
                testElection.addAlternatives([testAlternative], done);
            });
        });

    });
    after(function(done) {
        Alternative.remove({}, function() {
            Election.remove({}, done);
        });
    });

    it('should be able to create elections', function(done) {
        request(app)
            .post('/api/election')
            .send(testElection2)
            .end(function (err, res) {
                if (err) done(err);
                res.status.should.equal(201);
                res.body.title.should.equal(testElection2.title, 'db election title hash should be the same as api result');
                res.body.description.should.equal(testElection2.description, 'db election description hash should be the same as api result');
                done();
            });
    });

    it('should be able to get all elections', function(done) {
        request(app)
            .get('/api/election')
            .end(function (err,res){
                if (err) done(err);
                res.body[0].title.should.equal(testElection.title, 'db election title hash should be the same as api result');
                res.body[0].description.should.equal(testElection.description, 'db election description hash should be the same as api result');
                res.body[0]._id.should.equal(testElection._id.toString(), 'db election id hash should be the same as api result');
                done();
            });
    });

    it('should be able to get an election and its alternatives', function(done) {
        request(app)
            .get('/api/election/' + testElection._id)
            .end(function (err,res) {
                if (err) done(err);
                res.body.title.should.equal(testElection.title, 'db election title hash should be the same as api result');
                res.body.description.should.equal(testElection.description, 'db election description hash should be the same as api result');
                res.body.alternatives.length.should.not.equal(0, 'should not be empty');
                res.body.alternatives[0]._id.should.equal(testAlternative._id.toString(), 'should be the correct alternative');
                done();
            });
    });
});
