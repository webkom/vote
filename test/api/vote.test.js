var request = require('supertest');
var app = require('../../app');
var Alternative = require('../../app/models/alternative');
var Election = require('../../app/models/election');
var User = require('../../app/models/user');
var chai = require('chai');
chai.should();


describe('Vote API', function() {
    var testElection = new Election({
        title: 'aasasdadssdas',
        description: 'testElection'
    });

    var testAlternative = new Alternative({
        description: 'testAlternative'
    });

    var testAlternative2 = new Alternative({
        description: 'testAlternative2'
    });
    var users;


    before(function(done) {
        Alternative.remove({}, function() {
            Election.remove({}, function() {
                User.remove({}, function() {
                    testElection.addAlternative(testAlternative, function(err, res) {
                        testElection.addAlternative(testAlternative2, function(err, res) {
                            request(app)
                                .post('/api/user/create')
                                .send({amount: 5})
                                .end(function(err, res) {
                                    users = res.body;
                                    done();
                                });
                        });
                    });
                });

            });
        });

    });
    after(function(done) {
        Alternative.remove({}, function() {
            User.remove({}, function() {
                Election.remove({}, done);
            });
        });
    });

    it('should be able to vote on alternative', function(done) {
        request(app)
            .post('/api/vote/' + testAlternative._id)
            .send(users[0])
            .end(function(err, res) {
                if (err) return done(err);
                request(app)
                    .get('/api/vote/' + testAlternative._id)
                    .end(function(err, res) {
                        console.log();
                        res.body.length.should.equal(1, 'one vote should exist');
                        done();
                    });
            });
    });

    it('should be able to vote only once', function(done) {
        request(app)
            .post('/api/vote/' + testAlternative._id)
            .send(users[0])
            .end(function(err, res) {
                if (err) return done(err);
                Alternative.find({})
                    .populate('votes')
                    .exec(function(err, alternatives) {
                        alternatives[1].votes.length.should.equal(1, 'only one vote should exist');
                        done();
                    });
            });
    });

    it('should not be able to vote with inactive user', function(done) {
        User.findOne({username: users[1].username}, function(err, usr) {
            usr.active = false;
            usr.save(function() {
                request(app)
                    .post('/api/vote/' + testAlternative2._id)
                    .send(users[1])
                    .end(function(err, res) {
                        if (err) return done(err);
                        Alternative.find({})
                            .populate('votes')
                            .exec(function(err, alternatives) {
                                alternatives[0].votes.length.should.equal(0, 'no vote should be added');
                                done();
                            });
                    });
            });

        });

    });

});