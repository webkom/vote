const request = require('supertest');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const app = require('../../app');
chai.use(sinonChai);

describe('Qr API', () => {
  const ioStub = {
    emit: sinon.stub()
  };

  before(() => {
    app.set('io', ioStub);
  });

  it('should notify moderator when user opens qr', async function() {
    const code = 'randomCode';
    await request(app)
      .get(`/api/qr/open/?code=${code}`)
      .expect(200);
    ioStub.emit.should.have.been.calledWith('qr-opened', code);
  });
});
