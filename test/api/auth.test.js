var request = require('supertest');
var mongoose = require('mongoose');
var chai = require('chai');
var app = require('../../app');
var should = chai.should();
var User = require('../../app/models/user');

describe('Auth API', function() {
    var testUser = {
        username: 'test',
        password: 'test121312313'
    };

    var badTestUser = {
        username: 'test',
        password: 'notthecorrectpw'
    };

    beforeEach(function() {
        return User.removeAsync({})
        .then(function() {
            return User.registerAsync(testUser, testUser.password);
        });
    });

    it('should be able to authenticate users', function(done) {
        request(app)
            .post('/auth/login')
            .send(testUser)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                should.exist(res.body.username, 'should return a username');
                should.not.exist(res.body.password, 'password should not be returned');
                done();
            });
    });

    it('should deny users with bad credentials', function(done) {
        request(app)
            .post('/auth/login')
            .send(badTestUser)
            .expect(401)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('should be possible to logout', function(done) {
        var sessions = mongoose.connection.db.collection('sessions');

        sessions.drop(function(err) {
            if (err) return done(err);
            var agent = request.agent(app);

            agent
                .post('/auth/login')
                .send(testUser)
                .end(function(err, res) {
                    if (err) return done(err);
                    agent
                        .post('/auth/logout')
                        .expect(200)
                        .expect('Content-Type', /json/)
                        .end(function(err, res) {
                            if (err) return done(err);
                            res.body.message.should.equal('Successfully logged out.');
                            res.body.status.should.equal(200);
                            sessions
                                .find({})
                                .toArray(function(err, sessions) {
                                    sessions.length.should.equal(0);
                                    done();
                                });
                        });
                });
        });
    });
});
