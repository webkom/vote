var mongoose = require('mongoose');
var request = require('supertest');
var chai = require('chai');
var should = chai.should();
var assert = chai.assert;

module.exports = (models, app) => {
    describe("Auth", ()=> {
        var testUser = {
            username: "test",
            password: "test121312313"
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
        it('should be authenticated', done=>{
            request(app)
                .post('/auth/login')
                .send(testUser)
                .end((err,res)=>{
                    console.log(err);
                    should.not.exist(err, 'should be no errors on login');
                    console.log(res.status);
                    done();
                });
        });
    });
};