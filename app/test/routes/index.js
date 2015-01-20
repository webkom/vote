var request = require('supertest')
    ,server = require('../../server')
    ,app = server.app
    ,db = server.db
    ,chai = require('chai')
    ,should = chai.should();


describe("Auth API", function() {
    var testUser = {
        username: "test",
        password: "test121312313"
    };
    before(function(done) {
        db.User.remove({}, function(){
            new db.User(testUser).save(function (err, usr) {
                done();
            });
        });
    });
    after(function(done) {
        db.User.remove({}, done);
    });
    it('should be able to authenticate users', function(done){
        request(app)
         .post('/auth/login')
         .send(testUser)
         .end(function (err,res){
                should.not.exist(err, 'should be no errors on auth try');
                should.exist(res.body.username,'should return a cardkey');
                res.body.password.should.not.equal(testUser.password, 'password should be hashed');
                db.User.findOne({username: testUser.username}, function(err, usr){
                    res.body.password.should.equal(usr.password, 'db password hash should be the same as api result');
                    done();
                });
         });
    });
});

describe("User API", function() {
    var amount = 5;
    before(function(done) {
        db.User.remove({},done);

    });
    after(function(done) {
        db.User.remove({}, done);
    });
    it('should be able to create users', function(done){
        request(app)
            .post('/api/user/create')
            .send({amount:amount})
            .end(function (err,res){
                should.not.exist(err, 'should be no errors on create users');
                db.User.find({}, function(err, res){
                    res.length.should.equal(amount, 'should be the correct amount of users in db');
                    done();
                });
            });
    });

    it('should be able to get users', function(done){
        request(app)
            .get('/api/user')
            .end(function (err,res){
                should.not.exist(err, 'should be no errors on get users');
                res.body.length.should.equal(amount, 'should be the correct amount of users returned from api');
                done();
            });

    });
});

describe("Election API", function() {
    var testElection = new db.Election({
        title:        "asdadasd",
        description:  "asdsadadasd"
    });
    var testElection2 = new db.Election({
        title:        "asdadasd2sd",
        description:  "asdsadsd23adasd"
    });

    var testAlternative = new db.Alternative({
        description: "aaaaaaasss"
    });


    before(function(done) {
        db.Alternative.remove({}, function(){
            db.Election.remove({}, function(){
                testElection.addAlternatives([testAlternative], function(){
                    testElection.save(done);
                });
            });
        });

    });
    after(function(done) {
        db.Alternative.remove({}, function(){
            db.Election.remove({}, done);
        });
    });

    it('should be able to create elections', function(done){
        request(app)
            .post('/api/election')
            .send(testElection2)
            .end(function (err,res){
                should.not.exist(err, 'should be no errors on create election');
                res.body.title.should.equal(testElection2.title, 'db election title hash should be the same as api result');
                res.body.description.should.equal(testElection2.description, 'db election description hash should be the same as api result');
                done();
            });
    });

    it('should be able to get all elections', function(done){
        request(app)
            .get('/api/election')
            .end(function (err,res){
                should.not.exist(err, 'should be no errors on get all elections');
                res.body[0].title.should.equal(testElection.title, 'db election title hash should be the same as api result');
                res.body[0].description.should.equal(testElection.description, 'db election description hash should be the same as api result');
                res.body[0]._id.should.equal(testElection._id.toString(), 'db election id hash should be the same as api result');
                done();
            });
    });

    it('should be able to get an election with alternatives', function(done){
        request(app)
            .get('/api/election/'+testElection._id)
            .end(function (err,res){
                should.not.exist(err, 'should be no errors on get election');
                res.body.title.should.equal(testElection.title, 'db election title hash should be the same as api result');
                res.body.description.should.equal(testElection.description, 'db election description hash should be the same as api result');
                res.body.alternatives.length.should.not.equal(0,'should not be empty');
                res.body.alternatives[0]._id.should.equal(testAlternative._id.toString(),'should be the correct alternative');
                done();
            });
    });

});
