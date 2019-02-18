const _ = require('lodash');
const Bluebird = require('bluebird');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Election = require('./election');
const Vote = require('./vote');
const errors = require('../errors');
const env = require('../../env');

const redisClient = require('redis').createClient(6379, env.REDIS_URL);
const Redlock = require('redlock');

const redlock = new Redlock([redisClient], {});

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

alternativeSchema.methods.addVote = async function(user) {
  if (!user) throw new Error("Can't vote without a user");
  if (!user.active) throw new errors.InactiveUserError(user.username);
  if (user.admin) throw new errors.AdminVotingError();
  if (user.moderator) throw new errors.ModeratorVotingError();

  const lock = await redlock.lock('vote:' + user.username, 2000);
  const election = await Election.findById(this.election).exec();
  if (!election.active) {
    await lock.unlock();
    throw new errors.InactiveElectionError();
  }
  const votedUsers = election.hasVotedUsers.toObject();
  const hasVoted = _.find(votedUsers, { user: user._id });
  if (hasVoted) {
    await lock.unlock();
    throw new errors.AlreadyVotedError();
  }

  // 24 character random string
  const voteHash = crypto.randomBytes(12).toString('hex');
  const vote = new Vote({ hash: voteHash, alternative: this.id });

  election.hasVotedUsers.push({ user: user._id });
  await election.save();
  const savedVote = await vote.save();

  await lock.unlock();

  return savedVote;
};

module.exports = mongoose.model('Alternative', alternativeSchema);
