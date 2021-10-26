import request from 'supertest';
import chai from 'chai';
import app from '../../app';

chai.should();

export const test404 = async (method, path, type) => {
  const { body: error } = await request(app)
    [method](path)
    .expect(404)
    .expect('Content-Type', /json/);

  error.status.should.equal(404);
  error.message.should.equal(`Couldn't find ${type}.`);
};

export const testAdminResource = async (method, path) => {
  const { body: error } = await request(app)
    [method](path)
    .expect(403)
    .expect('Content-Type', /json/);

  error.status.should.equal(403);
  error.message.should.equal(
    'You need to be an admin to access this resource.'
  );
};
