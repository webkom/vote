const _ = require('lodash');
const Bluebird = require('bluebird');
const errors = require('../errors');
const mongoose = require('mongoose');
const Vote = require('./vote');
const Schema = mongoose.Schema;

const stv = require('../stv/stv.js');

const env = require('../../env');
const redisClient = require('redis').createClient(6379, env.REDIS_URL);
const Redlock = require('redlock');
const redlock = new Redlock([redisClient], {});

const crypto = require('crypto');

const hasVotedSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

const electionSchema = new Schema({
  title: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
  },
  active: {
    type: Boolean,
    default: false,
  },
  hasVotedUsers: [hasVotedSchema],
  alternatives: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Alternative',
    },
  ],
  seats: {
    type: Number,
    default: 1,
  },
  votes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Vote',
    },
  ],
});

// TODO
electionSchema.pre('remove', function (next) {
  // Use mongoose.model getter to avoid circular dependencies
  mongoose
    .model('Alternative')
    .find({ election: this.id })
    .then((alternatives) => {
      Bluebird.map(alternatives, (alternative) => alternative.remove());
    })
    .nodeify(next);
  mongoose
    .model('Vote')
    .find({ election: this.id })
    .then((votes) => {
      Bluebird.map(votes, (vote) => vote.remove());
    })
    .nodeify(next);
});

electionSchema.methods.elect = async function () {
  if (this.active) {
    throw new errors.ActiveElectionError(
      'Cannot retrieve results on an active election.'
    );
  }

  await this.populate('alternatives')
    .populate({
      path: 'votes',
      model: 'Vote',
      populate: {
        path: 'priorities',
        model: 'Alternative',
      },
    })
    .execPopulate();

  const cleanElection = this.toJSON();
  return stv.calculateWinnerUsingSTV(
    cleanElection.votes,
    cleanElection.alternatives,
    cleanElection.seats
  );
};

electionSchema.methods.addAlternative = async function (alternative) {
  alternative.election = this._id;
  const savedAlternative = await alternative.save();
  this.alternatives = [...this.alternatives, savedAlternative];
  await this.save();
  return savedAlternative;
};

electionSchema.methods.addVote = async function (user, priorities) {
  if (!user) throw new Error("Can't vote without a user");
  if (!user.active) throw new errors.InactiveUserError(user.username);
  if (user.admin) throw new errors.AdminVotingError();
  if (user.moderator) throw new errors.ModeratorVotingError();

  const lock = await redlock.lock('vote:' + user.username, 2000);
  if (!this.active) {
    await lock.unlock();
    throw new errors.InactiveElectionError();
  }
  const votedUsers = this.hasVotedUsers.toObject();
  const hasVoted = _.find(votedUsers, { user: user._id });

  if (hasVoted) {
    await lock.unlock();
    throw new errors.AlreadyVotedError();
  }

  // 24 character random string
  const voteHash = crypto.randomBytes(12).toString('hex');
  const vote = new Vote({
    hash: voteHash,
    election: this.id,
    priorities: priorities,
  });

  this.hasVotedUsers.push({ user: user._id });
  await this.save();

  const savedVote = await vote.save();
  this.votes.push(savedVote._id);

  await this.save();

  await lock.unlock();

  return savedVote;
};

module.exports = mongoose.model('Election', electionSchema);
