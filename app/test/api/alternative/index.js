var request = require('supertest')
    ,server = require('../../../server')
    ,app = server.app
    ,db = server.db
    ,chai = require('chai')
    ,should = chai.should();

describe("Alternatives API", function() {
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


    before(function(done) {
        db.Alternative.remove({}, function(){
            db.Election.remove({}, function(){
                testElection.save(done);
            });
        });

    });
    afterEach(function(done) {
        db.Alternative.remove({}, done);

    });

    it('should be able to create multiple alternatives', function(done){
        request(app)
            .post('/api/election/'+testElection._id+'/alternatives')
            .send([testAlternative,testAlternative2])
            .end(function (err,res){
                should.not.exist(err, 'should be no errors on get election');
                res.status.should.equal(201);
                request(app)
                    .get('/api/election/'+testElection._id+'/alternatives')
                    .end(function (err,res){

                        res.body[0].description.should.equal(testAlternative.description, 'should be the same as api result');
                        res.body[1].description.should.equal(testAlternative2.description, 'should be the same as api result');
                        done();
                    });
            });
    });

    it('should be able to create one alternative', function(done){
        request(app)
            .post('/api/election/'+testElection._id+'/alternatives')
            .send(testAlternative)
            .end(function (err,res){
                should.not.exist(err, 'should be no errors on get election');
                res.status.should.equal(201);
                request(app)
                    .get('/api/election/'+testElection._id+'/alternatives')
                    .end(function (err,res){
                        res.body[0].description.should.equal(testAlternative.description, 'should be the same as api result');
                        done();
                    });
            });
    });

});