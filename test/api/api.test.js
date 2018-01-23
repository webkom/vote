const chai = require('chai');
const helpers = require('./helpers');
const test404 = helpers.test404;
chai.should();

describe('API', () => {
  it('should return 404 for GETs to nonexistent API endpoints', done => {
    test404('get', '/api/nonexistent', '/api/nonexistent', done);
  });

  it('should return 404 for POSTs to nonexistent API endpoints', done => {
    test404('post', '/api/nonexistent', '/api/nonexistent', done);
  });
});
