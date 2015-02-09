var request = require('supertest');
var passportStub = require('passport-stub');
var chai = require('chai');
var app = require('../../app');
var User = require('../../app/models/user');
var helpers = require('./helpers');
var testAdminResourceGet = helpers.testAdminResourceGet;
var testAdminResourcePost = helpers.testAdminResourcePost;
var createUsers = helpers.createUsers;
var should = chai.should();

describe('User API', function() {
    before(function() {
        passportStub.install(app);
    });

    beforeEach(function() {
        passportStub.logout();
        return User.removeAsync({}).bind(this)
            .then(function() {
                return createUsers();
            })
            .spread(function(user, adminUser) {
                this.user = user;
                this.adminUser = adminUser;
            });
    });

    after(function() {
        passportStub.logout();
        passportStub.uninstall();
    });

    var testUserData = {
        username: 'newUser',
        password: 'password'
    };

    it('should be possible to create users', function(done) {
        passportStub.login(this.adminUser);
        request(app)
            .post('/api/user')
            .send(testUserData)
            .expect(201)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                res.status.should.equal(201);

                var createdUser = res.body;
                createdUser.active.should.equal(true);
                createdUser.admin.should.equal(false);

                return User.findOneAsync({ username: testUserData.username })
                .then(function(user) {
                    should.not.exist(user.password);
                    createdUser.username.should.equal(user.username);
                }).nodeify(done);
            });
    });

    it('should not be possible to create users without being admin', function(done) {
        passportStub.login(this.user);
        testAdminResourcePost('/api/user', done);
    });

    it('should return 400 when creating users without required fields', function(done) {
        passportStub.login(this.adminUser);
        request(app)
            .post('/api/user')
            .expect(400)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                var error = res.body;
                error.name.should.equal('InvalidRegistrationError');
                error.status.should.equal(400);
                done();
            });
    });

    it('should be able to get users', function(done) {
        passportStub.login(this.adminUser);
        request(app)
            .get('/api/user')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                var users = res.body;
                users.length.should.equal(2);

                should.exist(users[0].username);
                should.exist(users[0].active);
                should.exist(users[0].admin);
                should.not.exist(users[0].password);
                done();
            });
    });

    it('should not be possible to get users without being admin', function(done) {
        passportStub.login(this.user);
        testAdminResourceGet('/api/user', done);
    });
});
