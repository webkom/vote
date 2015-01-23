var request = require('supertest')
    ,server = require('../../../server')
    ,app = server.app
    ,db = server.db
    ,chai = require('chai')
    ,should = chai.should();

describe("Vote API", function() {
    var testElection = new db.Election({
        title:        "aasasdadssdas",
        description:  "testElection"
    });

    var testAlternative = new db.Alternative({
        description: "testAlternative"
    });

    var testAlternative2 = new db.Alternative({
        description: "testAlternative2"
    });
    var users;


    before(function(done) {
        db.Alternative.remove({}, function(){
            db.Election.remove({}, function(){
                db.User.remove({}, function(){
                    testElection.addAlternatives([testAlternative,testAlternative2], function(err, res){
                        request(app)
                            .post('/api/user/create')
                            .send({amount:5})
                            .end(function(err, res){
                                users = res.body;
                                done();
                            });
                    })
                });

            });
        });

    });
    after(function(done) {
        db.Alternative.remove({}, function(){
            db.User.remove({}, function(){
                db.Election.remove({}, done);
            });
        });
    });

    it('should be able to vote on alternative', function(done){
        request(app)
            .post('/api/vote/'+testAlternative._id)
            .send(users[0])
            .end(function (err,res){
                should.not.exist(err, 'should be no errors on get election');
                db.Alternative.find({})
                    .populate('votes')
                    .exec(function(err, alternatives){
                        alternatives[1].votes.length.should.equal(1, 'one vote should have been added');

                        done();
                    });
            });
    });

    it('should be able to vote only once', function(done){
        request(app)
            .post('/api/vote/'+testAlternative._id)
            .send(users[0])
            .end(function (err,res){
                should.not.exist(err, 'should be no errors on get election');
                db.Alternative.find({})
                    .populate('votes')
                    .exec(function(err, alternatives){
                        alternatives[1].votes.length.should.equal(1, 'one vote should have been added');
                        done();
                    });
            });
    });

    it('should not be able to vote with inactive user', function(done){
        db.User.findOne({username: users[1].username}, function(err, usr){
            usr.active = false;
            usr.save(function(){
                request(app)
                    .post('/api/vote/'+testAlternative2._id)
                    .send(users[1])
                    .end(function (err,res){
                        should.not.exist(err, 'should be no errors on get election');
                        db.Alternative.find({})
                            .populate('votes')
                            .exec(function(err, alternatives){
                                alternatives[0].votes.length.should.equal(0, 'no vote should be added');
                                done();
                            });
                    });

            })

        });

    });

});