import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import errors, { handleError } from '../../app/errors';

chai.use(sinonChai);
chai.should();

describe('handleError', () => {
  const stub = sinon.stub();
  const res = {
    status() {
      return {
        json: stub,
      };
    },
  };

  it('should set status code 500 as default', () => {
    const testError = new Error('test error');
    handleError(res, testError);
    stub.should.have.been.calledWith({
      name: 'Error',
      status: 500,
      message: 'test error',
    });
  });

  it('should use a provided status code', () => {
    const testError = new errors.LoginError();
    handleError(res, testError, 417);
    stub.should.have.been.calledWith({
      name: 'LoginError',
      status: 417,
      message: testError.message,
    });
  });
});
