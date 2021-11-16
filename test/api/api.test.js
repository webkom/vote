import chai from 'chai';
import request from 'supertest';
import app from '../../app';
import { test404 } from './helpers';

chai.should();

describe('API', () => {
  it('should return 404 for GETs to nonexistent API endpoints', async () => {
    await test404('get', '/api/nonexistent', '/api/nonexistent');
  });

  it('should return 404 for POSTs to nonexistent API endpoints', async () => {
    await test404('post', '/api/nonexistent', '/api/nonexistent');
  });

  it('should return 200 for /healthz', async () => {
    const { body } = await request(app).get('/healthz').expect(200);

    body.should.deep.equal({});
  });
});
