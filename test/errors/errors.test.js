var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var errors = require('../../app/errors');

chai.use(sinonChai);
chai.should();

describe('handleError', function() {
    var stub = sinon.stub();
    var res = {
        status() {
            return {
                json: stub
            };
        }
    };

    it('should set status code 500 as default', function() {
        var testError = new Error('test error');
        errors.handleError(res, testError);
        stub.should.have.been.calledWith({
            name: 'Error',
            status: 500,
            message: 'test error'
        });
    });

    it('should use a provided status code', function() {
        var testError = new errors.LoginError();
        errors.handleError(res, testError, 417);
        stub.should.have.been.calledWith({
            name: 'LoginError',
            status: 417,
            message: testError.message
        });
    });
});
