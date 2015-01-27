var request = require('supertest');
var chai = require('chai');
var app = require('../../app');
var User = require('../../app/models/user');
var should = chai.should();

describe('User API', function() {
    var testUserData = {
        username: 'testUser',
        password: 'password'
    };

    beforeEach(function() {
        return User.removeAsync({});
    });

    it('should be able to create user', function(done) {
        request(app)
            .post('/auth/register')
            .send(testUserData)
            .end(function(err, res) {
                if (err) done(err);
                res.status.should.equal(201);

                var createdUser = res.body;
                createdUser.active.should.equal(true);
                createdUser.admin.should.equal(false);

                User.findOneAsync({ username: testUserData.username })
                .then(function(user) {
                    createdUser.username.should.equal(user.username);
                    done();
                })
                .catch(function(err) {
                    done(err);
                });
            });
    });

    it('should be able to get users', function(done) {
        User.registerAsync(testUserData, testUserData.password)
            .then(function(user) {
                request(app)
                    .get('/api/user')
                    .end(function(err, res) {
                        if (err) return done(err);
                        var createdUser = res.body[0];
                        createdUser.username.should.equal(testUserData.username);
                        should.not.exist(createdUser.password);
                        done();
                    });
            })
            .catch(done);
    });
});
