var Bluebird = require('bluebird');
var request = require('supertest');
var mongoose = require('mongoose');
var chai = require('chai');
var passportStub = require('passport-stub');
var app = require('../../app');
var User = require('../../app/models/user');
chai.should();

describe('Auth API', function() {
    var testUser = {
        username: 'testuser',
        password: 'test121312313',
        cardKey: '99TESTCARDKEY'
    };

    var adminUser = {
        username: 'admin',
        password: 'admin',
        admin: true,
        cardKey: '11TESTCARDKEY'
    };

    var badTestUser = {
        username: 'testuser',
        password: 'notthecorrectpw',
        cardKey: '00TESTCARDKEY'
    };

    beforeEach(function() {
        passportStub.logout();
        passportStub.uninstall();
        return Bluebird.all([
            User.register(testUser, testUser.password),
            User.register(adminUser, adminUser.password)
        ]);
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

    it('should strip spaces on login', function(done) {
        request(app)
            .post('/auth/login')
            .send({
                username: testUser.username + '    ',
                password: testUser.password
            })
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
                        res.text.should.include('Brukernavn og/eller passord er feil.');
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

    it('should redirect from / to /admin for admins', function(done) {
        passportStub.install(app);
        passportStub.login(adminUser);

        request(app)
            .get('/')
            .expect(302)
            .expect('Location', '/admin')
            .end(done);
    });
});
