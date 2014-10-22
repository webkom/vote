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

    describe("Election", ()=> {
        var testElection= new models.Election({
            title: "test1",
            description: "prompetiss"
        });
        var testAlternative = new models.Alternative({
            description: 'asdadsad'
        });
        var testAlternative2 = new models.Alternative({
            description: 'asdadsadasd'
        });

        testElection.addAlternative(testAlternative);
        testElection.addAlternative(testAlternative2);

        before(done => {
            testElection.save(err => {
                should.not.exist(err);
                testAlternative.save(err =>{
                    should.not.exist(err);
                    testAlternative2.save(done);
                });
            });
        });
        after(done => {
            models.Election.remove({}, ()=>{
                models.Alternative.remove({}, done);
            });
        });
        it('should be able to be found in the db', done => {
            models.Election.findById(testElection._id)
                .populate('alternatives')
                .exec((err, el)=> {
                    should.not.exist(err);
                    should.exist(el);
                    el.title.should.equal(testElection.title, 'retrieved title should match the saved title');
                    el.description.should.equal(testElection.description, 'retrieved description should match the saved description');
                    el.alternatives[0]._id.toString().should.equal(testAlternative._id.toString());
                    el.alternatives[1]._id.toString().should.equal(testAlternative2._id.toString());
                    done();
                });
        });
    });
};

