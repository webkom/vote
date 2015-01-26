var request = require('supertest');
var chai = require('chai');
var app = require('../../app');
var User = require('../../app/models/user');

chai.should();

describe('User API', function() {
    var amount = 5;

    before(function(done) {
        User.remove({}, done);
    });

    after(function(done) {
        User.remove({}, done);
    });

    it('should be able to create users', function(done) {
        request(app)
            .post('/api/user/create')
            .send({ amount: amount })
            .end(function(err, res) {
                if (err) done(err);
                res.status.should.equal(201);
                User.find({}, function(err, res) {
                    res.length.should.equal(amount, 'should be the correct amount of users in db');
                    done();
                });
            });
    });

    it('should be able to get users', function(done) {
        request(app)
            .get('/api/user')
            .end(function(err, res) {
                if (err) done(err);
                res.body.length.should.equal(amount, 'should be the correct amount of users returned from api');
                done();
            });
    });
});
