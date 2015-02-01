var Bluebird = require('bluebird');
var request = require('supertest');
var chai = require('chai');
var app = require('../../app');
var User = require('../../app/models/user');

chai.should();

exports.testGet404 = function(path, type, done) {
    request(app)
        .get(path)
        .expect(404)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
            if (err) return done(err);
            var error = res.body;
            error.status.should.equal(404);
            error.message.should.equal('Couldn\'t find ' + type + '.');
            done();
        });
};

exports.testPost404 = function(path, type, done) {
    request(app)
        .post(path)
        .expect(404)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
            if (err) return done(err);
            var error = res.body;
            error.status.should.equal(404);
            error.message.should.equal('Couldn\'t find ' + type + '.');
            done();
        });
};

function checkAdminResource(err, res, done) {
    if (err) return done(err);
    var error = res.body;
    error.status.should.equal(403);
    error.message.should.equal('You need to be an admin to access this resource.');
    done();
}

exports.testAdminResourceGet = function(path, done) {
    request(app)
        .get(path)
        .expect(403)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
            checkAdminResource(err, res, done);
        });
};

exports.testAdminResourcePost = function(path, done) {
    request(app)
        .post(path)
        .expect(403)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
            checkAdminResource(err, res, done);
        });
};

exports.createUsers = function() {
    var testUser = {
        username: 'testUser'
    };
    var adminUser = {
        username: 'admin',
        admin: true
    };
    var testPassword = 'password';

    return Bluebird.all([
        User.registerAsync(testUser, testPassword),
        User.registerAsync(adminUser, testPassword)
    ]);
};
