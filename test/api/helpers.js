const request = require('supertest');
const chai = require('chai');
const app = require('../../app');

chai.should();

exports.test404 = async (method, path, type) => {
  const { body: error } = await request(app)
    [method](path)
    .expect(404)
    .expect('Content-Type', /json/);

  error.status.should.equal(404);
  error.message.should.equal(`Couldn't find ${type}.`);
};

exports.testAdminResource = async (method, path) => {
  const { body: error } = await request(app)
    [method](path)
    .expect(403)
    .expect('Content-Type', /json/);

  error.status.should.equal(403);
  error.message.should.equal(
    'You need to be an admin to access this resource.'
  );
};
