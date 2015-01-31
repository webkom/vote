var request = require('supertest');
var chai = require('chai');
var app = require('../../app');

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
