var request = require('supertest')
    ,server = require('../../server')
    ,app = server.app
    ,db = server.db
    ,chai = require('chai')
    ,should = chai.should();


describe("Auth", function() {
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