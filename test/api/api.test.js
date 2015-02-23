var chai = require('chai');
var helpers = require('./helpers');
var testGet404 = helpers.testGet404;
var testPost404 = helpers.testPost404;
chai.should();

describe('API', function() {
    it('should return 404 for GETs to nonexistent API endpoints', function(done) {
        testGet404('/api/nonexistent', '/api/nonexistent', done);
    });

    it('should return 404 for POSTs to nonexistent API endpoints', function(done) {
        testPost404('/api/nonexistent', '/api/nonexistent', done);
    });
});
