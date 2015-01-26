var request = require('supertest');
var chai = require('chai');
var app = require('../../app');
var should = chai.should();
var User = require('../../app/models/user');

describe('Auth API', function() {
    var testUser = {
        username: 'test',
        password: 'test121312313'
    };

    before(function(done) {
        User.remove({}, function() {
            User.create(testUser, done);
        });
    });

    after(function(done) {
        User.remove({}, done);
    });

    it('should be able to authenticate users', function(done) {
        request(app)
            .post('/auth/login')
            .send(testUser)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) done(err);
                should.exist(res.body.username, 'should return a cardkey');
                res.body.password.should.not.equal(testUser.password, 'password should be hashed');
                User.findOne({ username: testUser.username }, function(err, usr) {
                    res.body.password.should.equal(usr.password, 'db password hash should be the same as api result');
                    done();
                });
            });
    });
});
