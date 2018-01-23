const request = require('supertest');
const chai = require('chai');
const app = require('../../app');
const User = require('../../app/models/user');

chai.should();

exports.test404 = (method, path, type, done) => {
  request(app)
    [method](path)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) return done(err);
      const error = res.body;
      error.status.should.equal(404);
      error.message.should.equal(`Couldn't find ${type}.`);
      done();
    });
};

exports.testAdminResource = (method, path, done) => {
  request(app)
    [method](path)
    .expect(403)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) return done(err);
      const error = res.body;
      error.status.should.equal(403);
      error.message.should.equal(
        'You need to be an admin to access this resource.'
      );
      done();
    });
};

const hash = '$2a$10$qxTI.cWwa2kwcjx4SI9KAuV4KxuhtlGOk33L999UQf1rux.4PBz7y'; // 'password'
const testUser = (exports.testUser = {
  username: 'testuser',
  cardKey: '99TESTCARDKEY',
  hash
});

const adminUser = (exports.adminUser = {
  username: 'admin',
  admin: true,
  cardKey: '55TESTCARDKEY',
  hash
});

exports.createUsers = () => User.create([testUser, adminUser]);
