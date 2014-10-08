var chai = require('chai');
var should = chai.should();
var assert = chai.assert;

module.exports = models => {
    describe("User", ()=> {
        var testUser = {
            username: "test",
            password: "prompetiss"
        };
        before(done => {
            new models.User(testUser).save((err, usr)=> {
                should.not.exist(err);
                done();
            });
        });
        after(done => {
            models.User.remove({}, done);
        });
        it('should be able to be found in the db', done => {
            models.User.findOne({username: testUser.username}, (err, usr)=> {
                should.not.exist(err);
                should.exist(usr);
                usr.username.should.equal(testUser.username, 'retrieved username should match the saved username');
                usr.password.should.not.equal(testUser.password, 'password should be hashed before save');
                done();
            });
        });
        it('should be able to validate password', done => {
            models.User.findOne({username: testUser.username}, (err, usr)=> {
                usr.validPassword(testUser.password, (err, res)=> {
                    should.not.exist(err, 'password validation should not have errors');
                    assert(res, 'password should be valid');
                    done();
                });
            });
        });
    });
};

