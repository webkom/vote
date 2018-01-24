const chai = require('chai');
const spawn = require('child_process').spawn;
const User = require('../../app/models/user');
const should = chai.should();

describe('Users CLI', () => {
  beforeEach(() => User.remove({}));

  it('should create admin users', done => {
    const stream = spawn(`${process.cwd()}/bin/users`, [
      'create-admin',
      'testuser',
      'testcardkey'
    ]);

    stream.stdin.setEncoding('utf8');
    stream.stdout.setEncoding('utf8');
    stream.stdin.write('testpw\n');

    let output = '';
    stream.stdout.on('data', data => {
      output += data;
    });

    stream.on('close', () => {
      output.should.include('Created user testuser');
      User.findOne({ username: 'testuser' })
        .then(user => {
          user.admin.should.equal(true);
          should.not.exist(user.password);
        })
        .nodeify(done);
    });
  });
});
