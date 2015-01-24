var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var Vote = require('./vote');
var User = require('./user');
var async = require('async');

var Schema = mongoose.Schema;

var alternativeSchema = new Schema({
    description: {
        type: String,
        required: true
    },
    votes: [
        {
            type: Schema.Types.ObjectId, ref: 'Vote'
        }
    ],
    election: {
        type: Schema.Types.ObjectId, ref: 'Election',
        required: true
    }
});

alternativeSchema.methods.addVote = function(username, next) {
    var that = this;
    User.findOne({username: username}, function(err, user) {
        if (err) return next(err);
        if (!user) return next({'message': 'No user with that username'});
        if (!user.active) return next({'message': 'User not active'});
        Vote.find({election: that.election}, function(err, votes) {
            if (err) return next(err);
            var voted;
            async.each(votes, function(vote, cb) {
                bcrypt.compare(user.username, vote.hash, function(err, res) {
                    if (err) return cb(err);
                    if (res) voted = true;
                    cb();
                });
            }, function(err) {
                if (err) return next(err);
                if (voted) return next({'message': 'Already voted'});
                bcrypt.hash(user.username, 5, function(err, hash) {
                    if (err) return next(err);
                    var vote = new Vote({hash: hash, election: that.election});
                    that.votes.push(vote);
                    vote.save(function(err, vote) {
                        if (err) return next(err);
                        that.save(next);
                    });
                });
            });
        });
    });
};

module.exports = mongoose.model('Alternative', alternativeSchema);
