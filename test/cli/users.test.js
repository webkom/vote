import { describe, test, beforeEach, afterAll } from 'vitest';
import chai from 'chai';
import { spawn } from 'child_process';
import User from '../../app/models/user';
const should = chai.should();

describe('User CLI', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  test('should create normal user', () =>
    new Promise((done) => {
      const stream = spawn(`${process.cwd()}/bin/users`, [
        'create-user',
        'normaluser',
        'testcardkey1',
        '-m',
        '1',
        '-p',
        'testpassword',
      ]);

      stream.stdout.setEncoding('utf8');
      stream.stderr.setEncoding('utf8');

      stream.stderr.on('data', (data) => {
        console.log(data);
      });

      let output = '';
      stream.stdout.on('data', (data) => {
        output += data;
        console.log(data);
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
    }));

  test('should create moderator user', () =>
    new Promise((done) => {
      const stream = spawn(`${process.cwd()}/bin/users`, [
        'create-user',
        'moderator',
        'testcardkey2',
        '-m',
        '2',
        '-p',
        'testpassword',
      ]);

      stream.stderr.setEncoding('utf8');
      stream.stderr.on('data', (data) => {
        console.log(data);
      });

      stream.stdout.setEncoding('utf8');

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
    }));

  test('should create admin user', () =>
    new Promise((done) => {
      const stream = spawn(`${process.cwd()}/bin/users`, [
        'create-user',
        'admin',
        'testcardkey3',
        '-m',
        '3',
        '-p',
        'testpassword',
      ]);

      stream.stderr.setEncoding('utf8');
      stream.stderr.on('data', (data) => {
        console.log(data);
      });

      stream.stdout.setEncoding('utf8');

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
    }));
});
