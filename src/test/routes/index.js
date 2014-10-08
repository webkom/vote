var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
var request = require('supertest');
var chai = require('chai');
var should = chai.should();
var assert = chai.assert;

module.exports = models => {
    describe("Auth", ()=> {
        var url = "http://localhost:3000";
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
        it('should be usable', done=>{
            //TODO: pls implement
            done();
        });
    });
};