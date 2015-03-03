var chai = require('chai');
var helpers = require('./helpers');
var test404 = helpers.test404;
chai.should();

describe('API', function() {
    it('should return 404 for GETs to nonexistent API endpoints', function(done) {
        test404('get', '/api/nonexistent', '/api/nonexistent', done);
    });

    it('should return 404 for POSTs to nonexistent API endpoints', function(done) {
        test404('post', '/api/nonexistent', '/api/nonexistent', done);
    });
});
