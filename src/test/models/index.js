var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
var assert = require('assert');

// mock mongoose
mockgoose(mongoose);

// fake connect to db
mongoose.connect('mongodb://localhost/fakedb');

// target
var models = require('../../models')(mongoose);

describe("User", ()=>{
    var testUser;
    before((done)=>{
        new models.User({
            username: "test",
            password: "test121312313"
        }).save((err,usr)=>{
            assert.equal(err,null);
            testUser = usr;
            done();
        });
    });
    it("should be found", ()=>{
        models.User.findOne({username:testUser.username}, (err,usr)=>{
            assert.equal(err,null);
            assert.equal(usr.username,testUser.username);
            assert.equal(usr.password,testUser.password);
        });
    })
});