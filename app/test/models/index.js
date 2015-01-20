var server = require('../../server')
    ,app = server.app
    ,db = server.db
    ,chai = require('chai')
    ,should = chai.should()
    ,assert = chai.assert
    ,async = require('async');

describe("User", function() {
    var testUser = {
        username: "test",
        password: "prompetiss"
    };
    before(function(done) {
        db.User.remove({}, function(){
            new db.User(testUser).save(function (err, usr) {
                should.not.exist(err);
                done();
            });

        });
    });
    after(function(done) {
        db.User.remove({}, done);
    });
    it('should be able to be found in the db', function(done) {
        db.User.findOne({username: testUser.username}, function (err, usr) {
            should.not.exist(err);
            should.exist(usr);
            usr.username.should.equal(testUser.username, 'retrieved username should match the saved username');
            usr.password.should.not.equal(testUser.password, 'password should be hashed before save');
            done();
        });
    });
    it('should be able to validate password', function(done){
        db.User.findOne({username: testUser.username}, function (err, usr) {
            usr.validPassword(testUser.password, function (err, res) {
                should.not.exist(err, 'password validation should not have errors');
                assert(res, 'password should be valid');
                done();
            });
        });
    });
});

describe("Election", function() {
    var testElection = new db.Election({
        title: "test1",
        description: "prompetiss"
    });
    var testAlternative = new db.Alternative({
        description: 'asdadsad'
    });
    var testAlternative2 = new db.Alternative({
        description: 'asdadsadasd'
    });

    testElection.addAlternative(testAlternative);
    testElection.addAlternative(testAlternative2);

    before(function(done) {
        testElection.save( function(err) {
            should.not.exist(err);
            testAlternative.save(function (err) {
                should.not.exist(err);
                testAlternative2.save(done);
            });
        });
    });
    after(function(done) {
        db.Election.remove({}, function () {
            db.Alternative.remove({}, done);
        });
    });
    it('should be able to be found in the db', function(done) {
        db.Election.findById(testElection._id)
            .populate('alternatives')
            .exec(function (err, el) {
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

describe("Vote",function () {
    var testElection = new db.Election({
        title: "test1",
        description: "prompetiss"
    });
    var testAlternative = new db.Alternative({
        description: 'asdadsad'
    });

    testElection.addAlternative(testAlternative);


    var testVote = new db.Vote({
        hash: 'asdadsasdad',
        alternative: testAlternative
    });

    var testVote2 = new db.Vote({
        hash: 'asdadsadsadadad',
        alternative: testAlternative
    });
    testAlternative.votes.push(testVote);
    testAlternative.votes.push(testVote2);


    before(function(done) {
        testElection.save(function (err) {
            should.not.exist(err);
            testAlternative.save(function(err) {
                should.not.exist(err);
                testVote.save(function(err) {
                    should.not.exist(err);
                    testVote2.save(function(err){
                        should.not.exist(err);
                        done();
                    });
                });
            });
        });
    });

    after(function(done) {
        db.Election.remove({}, function () {
            db.Alternative.remove({}, function () {
                db.Vote.remove({}, done);
            });
        });
    });

    it('should be able to be found in the db', function(done) {
        db.Election.findById(testElection._id)
            .populate('alternatives')
            .exec(function (err, el) {
                should.not.exist(err);
                should.exist(el);
                async.each(el.alternatives, function (alternative, cb) {
                    alternative.populate('votes', function (err, alternative) {
                        should.not.exist(err);
                        alternative.votes[0].hash.should.equal(testVote.hash,'retrived hash should be equal to testhash');
                        alternative.votes[1].hash.should.equal(testVote2.hash,'retrived hash should be equal to testhash');
                        cb();
                    });

                }, done);
            });
    });
});

