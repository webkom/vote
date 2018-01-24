const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const errors = require('../../app/errors');

chai.use(sinonChai);
chai.should();

describe('handleError', () => {
  const stub = sinon.stub();
  const res = {
    status() {
      return {
        json: stub
      };
    }
  };

  it('should set status code 500 as default', () => {
    const testError = new Error('test error');
    errors.handleError(res, testError);
    stub.should.have.been.calledWith({
      name: 'Error',
      status: 500,
      message: 'test error'
    });
  });

  it('should use a provided status code', () => {
    const testError = new errors.LoginError();
    errors.handleError(res, testError, 417);
    stub.should.have.been.calledWith({
      name: 'LoginError',
      status: 417,
      message: testError.message
    });
  });
});
