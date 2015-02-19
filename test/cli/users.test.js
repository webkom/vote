var chai = require('chai');
var spawn = require('child_process').spawn;
var User = require('../../app/models/user');
var should = chai.should();

describe('Users CLI', function() {
    beforeEach(function() {
        return User.removeAsync({});
    });

    it('should create admin users', function(done) {
        var stream = spawn(process.cwd() + '/bin/users', ['create-admin', 'testuser', 'testcardkey']);
        stream.stdin.setEncoding('utf8');
        stream.stdout.setEncoding('utf8');
        stream.stdin.write('testpw\n');

        var output = '';
        stream.stdout.on('data', function(data) {
            output += data;
        });

        stream.on('close', function() {
            output.should.include('Created user testuser');
            User.findOneAsync({ username: 'testuser' })
                .then(function(user) {
                    user.admin.should.equal(true);
                    should.not.exist(user.password);
                }).nodeify(done);
        });
    });
});
