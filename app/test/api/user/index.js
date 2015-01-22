var request = require('supertest')
    ,server = require('../../../server')
    ,app = server.app
    ,db = server.db
    ,chai = require('chai')
    ,should = chai.should();

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
                res.status.should.equal(201);
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




