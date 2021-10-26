import request from 'supertest';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import app from '../../app';
chai.use(sinonChai);

describe('Qr API', () => {
  const ioStub = {
    emit: sinon.stub(),
  };

  before(() => {
    app.set('io', ioStub);
  });

  it('should notify moderator when user opens qr', async function () {
    const code = 'randomCode';
    await request(app).get(`/api/qr/open/?code=${code}`).expect(200);
    ioStub.emit.should.have.been.calledWith('qr-opened', code);
  });
});
