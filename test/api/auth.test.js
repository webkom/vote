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

    before(function() {
        return User.removeAsync({})
        .then(function() {
            return User.createAsync(testUser);
        });
    });

    after(function() {
        return User.removeAsync({});
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
                User.findOneAsync({username: testUser.username})
                .then(function(user) {
                    res.body.password.should.equal(user.password, 'db password hash should be the same as api result');
                    done();
                })
                .catch(function(err) {
                    done(err);
                });
            });
    });
});
