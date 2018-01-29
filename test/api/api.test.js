const chai = require('chai');
const { test404 } = require('./helpers');

chai.should();

describe('API', () => {
  it('should return 404 for GETs to nonexistent API endpoints', async () => {
    await test404('get', '/api/nonexistent', '/api/nonexistent');
  });

  it('should return 404 for POSTs to nonexistent API endpoints', async () => {
    await test404('post', '/api/nonexistent', '/api/nonexistent');
  });
});
