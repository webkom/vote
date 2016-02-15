var _ = require('lodash');
var Bluebird = require('bluebird');
var crypto = require('crypto');
var mongoose = require('mongoose');
var Election = require('./election');
var Vote = require('./vote');
var errors = require('../errors');

var Schema = mongoose.Schema;

var alternativeSchema = new Schema({
    description: {
        type: String,
        required: true
    },
    election: {
        type: Schema.Types.ObjectId,
        ref: 'Election'
    }
});

alternativeSchema.pre('remove', function(next) {
    return Vote.find({ alternative: this.id })
        .then(function(votes) {
            return Bluebird.map(votes, function(vote) {
                // Have to call remove on each document to activate Vote's
                // remove-middleware
                return vote.remove();
            });
        }).nodeify(next);
});

alternativeSchema.methods.addVote = function(user) {
    if (!user) throw new Error('Can\'t vote without a user');
    if (!user.active) throw new errors.InactiveUserError(user.username);
    if (user.admin) throw new errors.AdminVotingError();

    return Election.findById(this.election).exec().bind(this)
        .then(function(election) {
            if (!election.active) throw new errors.InactiveElectionError();
            var votedUsers = election.hasVotedUsers.toObject();
            var hasVoted = _.find(votedUsers, { user: user._id });
            if (hasVoted) throw new errors.AlreadyVotedError();

            // 24 character random string
            var voteHash = crypto.randomBytes(12).toString('hex');
            var vote = new Vote({ hash: voteHash, alternative: this.id });

            election.hasVotedUsers.push({ user: user._id });
            return Bluebird.all([vote.save(), election.save()]);
        })
        .spread(function(voteResult) {
            return voteResult;
        });
};

module.exports = mongoose.model('Alternative', alternativeSchema);
