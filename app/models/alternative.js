const _ = require('lodash');
const Bluebird = require('bluebird');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Election = require('./election');
const Vote = require('./vote');
const errors = require('../errors');

const Schema = mongoose.Schema;

const alternativeSchema = new Schema({
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
    .then(votes =>
      Bluebird.map(votes, (
        vote // Have to call remove on each document to activate Vote's
      ) =>
        // remove-middleware
        vote.remove()
      )
    )
    .nodeify(next);
});

alternativeSchema.methods.addVote = function(user) {
  if (!user) throw new Error("Can't vote without a user");
  if (!user.active) throw new errors.InactiveUserError(user.username);
  if (user.admin) throw new errors.AdminVotingError();

  return Election.findById(this.election)
    .exec()
    .bind(this)
    .then(function(election) {
      if (!election.active) throw new errors.InactiveElectionError();
      const votedUsers = election.hasVotedUsers.toObject();
      const hasVoted = _.find(votedUsers, { user: user._id });
      if (hasVoted) throw new errors.AlreadyVotedError();

      // 24 character random string
      const voteHash = crypto.randomBytes(12).toString('hex');
      const vote = new Vote({ hash: voteHash, alternative: this.id });

      election.hasVotedUsers.push({ user: user._id });
      return Bluebird.all([vote.save(), election.save()]);
    })
    .spread(voteResult => voteResult);
};

module.exports = mongoose.model('Alternative', alternativeSchema);
