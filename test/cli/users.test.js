const chai = require('chai');
const spawn = require('child_process').spawn;
const User = require('../../app/models/user');
const should = chai.should();

describe('User CLI', () => {
  beforeEach(() => User.remove({}));

  it('should create normal user', done => {
    const stream = spawn(`${process.cwd()}/bin/users`, [
      'create-user',
      'normaluser',
      'testcardkey1'
    ]);

    stream.stdin.setEncoding('utf8');
    stream.stdout.setEncoding('utf8');

    stream.stdin.write('1\n');

    stream.stdout.on('data', data => {
      stream.stdin.write('testpassword\n');
    });

    let output = '';
    stream.stdout.on('data', data => {
      output += data;
    });

    stream.on('close', () => {
      output.should.include('Created user normaluser');
      User.findOne({ username: 'normaluser' })
        .then(user => {
          user.admin.should.equal(false);
          user.moderator.should.equal(false);
          should.not.exist(user.password);
        })
        .nodeify(done);
    });
  });

  it('should create moderator user', done => {
    const stream = spawn(`${process.cwd()}/bin/users`, [
      'create-user',
      'moderator',
      'testcardkey2'
    ]);

    stream.stdin.setEncoding('utf8');
    stream.stdout.setEncoding('utf8');

    stream.stdin.write('2\n');

    stream.stdout.on('data', data => {
      stream.stdin.write('testpassword\n');
    });

    let output = '';
    stream.stdout.on('data', data => {
      output += data;
    });

    stream.on('close', () => {
      output.should.include('Created user moderator');
      User.findOne({ username: 'moderator' })
        .then(user => {
          user.admin.should.equal(false);
          user.moderator.should.equal(true);
          should.not.exist(user.password);
        })
        .nodeify(done);
    });
  });

  it('should create admin user', done => {
    const stream = spawn(`${process.cwd()}/bin/users`, [
      'create-user',
      'admin',
      'testcardkey3'
    ]);

    stream.stdin.setEncoding('utf8');
    stream.stdout.setEncoding('utf8');

    stream.stdin.write('3\n');

    stream.stdout.on('data', data => {
      stream.stdin.write('testpassword\n');
    });

    let output = '';
    stream.stdout.on('data', data => {
      output += data;
    });

    stream.on('close', () => {
      output.should.include('Created user admin');
      User.findOne({ username: 'admin' })
        .then(user => {
          user.admin.should.equal(true);
          user.moderator.should.equal(true);
          should.not.exist(user.password);
        })
        .nodeify(done);
    });
  });
});
