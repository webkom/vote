var request = require('supertest');
var mongoose = require('mongoose');
var chai = require('chai');
var app = require('../../app');
var User = require('../../app/models/user');
chai.should();

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
            .expect(302)
            .end(function(err, res) {
                if (err) return done(err);
                res.header.location.should.equal('/');
                done();
            });
    });

    it('should redirect correctly on login', function(done) {
        var agent = request.agent(app);
        agent
            .get('/test')
            .expect(302)
            .end(function(err, res) {
                if (err) return done(err);
                agent
                    .post('/auth/login')
                    .send(testUser)
                    .expect(302)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.header.location.should.equal('/test');
                        done();
                    });
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
                        .expect(302)
                        .end(function(err, res) {
                            if (err) return done(err);
                            res.header.location.should.equal('/login');
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
