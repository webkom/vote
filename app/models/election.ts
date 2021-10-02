const _ = require('lodash');
const Bluebird = require('bluebird');
const errors = require('../errors');
const mongoose = require('mongoose');
const Vote = require('./vote');
const Schema = mongoose.Schema;
const calculateWinnerUsingNormal = require('../algorithms/normal.js').default;
const calculateWinnerUsingSTV = require('../algorithms/stv.js').default;
const crypto = require('crypto');
const ElectionTypes = require('./utils.js');

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
  hasVotedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  alternatives: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Alternative',
    },
  ],
  seats: {
    type: Number,
    default: 1,
    min: [1, 'An election should have at least one seat'],
  },
  votes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Vote',
    },
  ],
  type: {
    type: String,
    enum: [ElectionTypes.NORMAL, ElectionTypes.STV],
    default: ElectionTypes.NORMAL,
    validate: {
      validator: function (v) {
        return v === ElectionTypes.NORMAL && this.seats !== 1 ? false : true;
      },
      message: 'Normal elections must have exactly one seat',
    },
  },
  useStrict: {
    type: Boolean,
    default: false,
    validate: {
      validator: function (v) {
        return v && this.seats !== 1 ? false : true;
      },
      message: 'Strict elections must have exactly one seat',
    },
  },
  accessCode: {
    type: Number,
    // https://mongoosejs.com/docs/defaults.html#default-functions
    default: () => Math.floor(Math.random() * 9000 + 1000),
  },
  physical: {
    type: Boolean,
    default: true,
  },
});

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

  // Type of election decides algorithm
  if (cleanElection.type == ElectionTypes.NORMAL) {
    return calculateWinnerUsingNormal(
      cleanElection.votes,
      cleanElection.alternatives,
      cleanElection.seats,
      cleanElection.useStrict
    );
  } else if (cleanElection.type == ElectionTypes.STV) {
    return calculateWinnerUsingSTV(
      cleanElection.votes,
      cleanElection.alternatives,
      cleanElection.seats,
      cleanElection.useStrict
    );
  } else {
    throw new errors.InvalidElectionTypeError();
  }
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

  if (!this.active) {
    throw new errors.InactiveElectionError();
  }
  const votedUsers = this.hasVotedUsers.toObject();
  const hasVoted = _.find(votedUsers, { _id: user._id });

  if (hasVoted) {
    throw new errors.AlreadyVotedError();
  }

  // 24 character random string
  const voteHash = crypto.randomBytes(12).toString('hex');
  const vote = new Vote({
    hash: voteHash,
    election: this.id,
    priorities: priorities,
  });

  this.hasVotedUsers.push(user._id);
  await this.save();

  const savedVote = await vote.save();
  this.votes.push(savedVote._id);

  await this.save();

  return savedVote;
};

module.exports = mongoose.model('Election', electionSchema);
