var request = require('supertest');
var chai = require('chai');
var app = require('../../app');
var User = require('../../app/models/user');

chai.should();

exports.test404 = function(method, path, type, done) {
    request(app)[method](path)
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

exports.testAdminResource = function(method, path, done) {
    request(app)[method](path)
        .expect(403)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
            if (err) return done(err);
            var error = res.body;
            error.status.should.equal(403);
            error.message.should.equal('You need to be an admin to access this resource.');
            done();
        });
};

var hash = '$2a$10$qxTI.cWwa2kwcjx4SI9KAuV4KxuhtlGOk33L999UQf1rux.4PBz7y'; // 'password'
var testUser = exports.testUser = {
    username: 'testuser',
    cardKey: '99TESTCARDKEY',
    hash
};

var adminUser = exports.adminUser = {
    username: 'admin',
    admin: true,
    cardKey: '55TESTCARDKEY',
    hash
};

exports.createUsers = () => User.create([testUser, adminUser]);
