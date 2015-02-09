var chai = require('chai');
var exec = require('child_process').exec;
var User = require('../../app/models/user');
var should = chai.should();

describe('Users CLI', function() {
    beforeEach(function() {
        return User.removeAsync({});
    });

    it('should create admin users', function(done) {
        exec(process.cwd() + '/bin/users create-admin testuser pw', function(err, stdout, stderr) {
            if (err) return done(err);
            stdout.should.include('Created user testuser');

            User.findOneAsync({ username: 'testuser' })
                .then(function(user) {
                    user.admin.should.equal(true);
                    should.not.exist(user.password);
                }).nodeify(done);
        });
    });
});
