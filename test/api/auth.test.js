var request = require('supertest');
var mongoose = require('mongoose');
var chai = require('chai');
var app = require('../../app');
var User = require('../../app/models/user');
chai.should();

describe('Auth API', function() {
    var testUser = {
        username: 'test',
        password: 'test121312313',
        cardKey: '99TESTCARDKEY'
    };

    var badTestUser = {
        username: 'test',
        password: 'notthecorrectpw',
        cardKey: '00TESTCARDKEY'
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

    it('should redirect to login with flash on bad auth', function(done) {
        var agent = request.agent(app);
        agent
            .post('/auth/login')
            .send(badTestUser)
            .expect(302)
            .end(function(err, res) {
                if (err) return done(err);
                res.header.location.should.equal('/auth/login');

                agent
                    .get('/auth/login')
                    .expect(200)
                    .expect('Content-Type', /text\/html/)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.text.should.include('Incorrect password');
                        done();
                    });
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
                            res.header.location.should.equal('/auth/login');
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
