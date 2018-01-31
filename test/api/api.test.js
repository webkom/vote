const chai = require('chai');
const request = require('supertest');
const app = require('../../app');
const { test404 } = require('./helpers');

chai.should();

describe('API', () => {
  it('should return 404 for GETs to nonexistent API endpoints', async () => {
    await test404('get', '/api/nonexistent', '/api/nonexistent');
  });

  it('should return 404 for POSTs to nonexistent API endpoints', async () => {
    await test404('post', '/api/nonexistent', '/api/nonexistent');
  });

  it('should return 200 for /healthz', async () => {
    const { body } = await request(app)
      .get('/healthz')
      .expect(200);

    body.should.deep.equal({});
  });
});
