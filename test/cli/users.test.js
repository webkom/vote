import chai from 'chai';
import { spawn } from 'child_process';
import User from '../../app/models/user';
const should = chai.should();

describe('User CLI', () => {
  beforeEach(() => User.deleteMany({}));

  it('should create normal user', (done) => {
    const stream = spawn(`${process.cwd()}/bin/users`, [
      'create-user',
      'normaluser',
      'testcardkey1',
    ]);

    stream.stdin.setEncoding('utf8');
    stream.stdout.setEncoding('utf8');

    stream.stdout.on('data', (data) => {
      stream.stdin.write('1\n');
    });

    stream.stdout.on('data', (data) => {
      stream.stdin.write('testpassword\n');
    });

    let output = '';
    stream.stdout.on('data', (data) => {
      output += data;
    });

    stream.on('close', async () => {
      output.should.include('Created user normaluser');
      await User.findOne({ username: 'normaluser' }).then((user) => {
        user.admin.should.equal(false);
        user.moderator.should.equal(false);
        should.not.exist(user.password);
      });
      done();
    });
  });

  it('should create moderator user', (done) => {
    const stream = spawn(`${process.cwd()}/bin/users`, [
      'create-user',
      'moderator',
      'testcardkey2',
    ]);

    stream.stdin.setEncoding('utf8');
    stream.stdout.setEncoding('utf8');

    stream.stdin.write('2\n');

    stream.stdout.on('data', (data) => {
      stream.stdin.write('testpassword\n');
    });

    let output = '';
    stream.stdout.on('data', (data) => {
      output += data;
    });

    stream.on('close', async () => {
      output.should.include('Created user moderator');
      await User.findOne({ username: 'moderator' }).then((user) => {
        user.admin.should.equal(false);
        user.moderator.should.equal(true);
        should.not.exist(user.password);
      });
      done();
    });
  });

  it('should create admin user', (done) => {
    const stream = spawn(`${process.cwd()}/bin/users`, [
      'create-user',
      'admin',
      'testcardkey3',
    ]);

    stream.stdin.setEncoding('utf8');
    stream.stdout.setEncoding('utf8');

    stream.stdin.write('3\n');

    stream.stdout.on('data', (data) => {
      stream.stdin.write('testpassword\n');
    });

    let output = '';
    stream.stdout.on('data', (data) => {
      output += data;
    });

    stream.on('close', async () => {
      output.should.include('Created user admin');
      await User.findOne({ username: 'admin' }).then((user) => {
        user.admin.should.equal(true);
        user.moderator.should.equal(true);
        should.not.exist(user.password);
      });
      done();
    });
  });
});
