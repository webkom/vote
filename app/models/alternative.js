var crypto = require('crypto');
var mongoose = require('mongoose');
var Vote = require('./vote');
var User = require('./user');
var Election = require('../models/election');
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
    User.findOne({ username: username }, function(err, user) {
        if (err) return next(err);
        if (!user) return next({ message: 'No user with that username' });
        if (!user.active) return next({ message: 'User not active' });
        Election.findById(that.election, function(err, election) {
            if (err) return next(err);
            if (!election.active) return next({ message: 'Election not active' });

            var appSecret = process.env.APP_SECRET || 'dev_secret';
            var hash = crypto.createHash('sha512');
            hash.setEncoding('hex');
            hash.write(user.username);
            hash.write(appSecret);
            hash.end();
            var voteHash = hash.read();

            Vote.find({ election: that.election, hash: voteHash }, function(err, votes) {
                if (err) return next(err);
                if (votes.length > 0) return next({ message: 'Already voted' });
                var vote = new Vote({ hash: voteHash, election: that.election });
                that.votes.push(vote);
                vote.save(function(err, vote) {
                    if (err) return next(err);
                    that.save(next);
                });
            });
        });
    });

};

module.exports = mongoose.model('Alternative', alternativeSchema);
