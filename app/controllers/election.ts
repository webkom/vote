import Bluebird from 'bluebird';
import mongoose from 'mongoose';
import Election from '../models/election';
import User from '../models/user';
import Alternative from '../models/alternative';
import errors from '../errors';
import app from '../../app';

exports.load = (req, res, next, electionId) =>
  Election.findById(electionId)
    .then((election) => {
      if (!election) throw new errors.NotFoundError('election');
      req.election = election;
      next();
    })
    .catch(mongoose.Error.CastError, (err) => {
      throw new errors.NotFoundError('election');
    });

exports.retrieveActive = (req, res) =>
  Election.findOne({
    active: true,
    hasVotedUsers: { $ne: req.user._id },
  })
    .select('-hasVotedUsers')
    .populate('alternatives')
    .exec()
    .then(async (election) => {
      const { user, query } = req;
      // There is no active election (that the user has not voted on)
      if (!election) {
        throw new errors.NotFoundError('election');
      }

      // User is active, return the election
      if (user.active) {
        return res.status(200).json(election);
      }

      // Require the user to be active if the election is physical.
      if (election.physical) {
        throw new errors.InactiveUserError(user.username);
      }

      // Active election but wrong or not access code submitted,
      // so we return 403 which prompts a access code input field.
      if (
        !query.accessCode ||
        election.accessCode !== Number(query.accessCode)
      ) {
        throw new errors.AccessCodeError();
      }

      // Active election and the inactive user has the correct access code.
      // Therefore we activate the users account, and return the elction.
      await User.findByIdAndUpdate({ _id: user._id }, { active: true });
      return res.status(200).json(election);
    });

exports.create = (req, res) =>
  Election.create({
    title: req.body.title,
    description: req.body.description,
    seats: req.body.seats,
    type: req.body.type,
    useStrict: req.body.useStrict,
    physical: req.body.physical,
  })
    .then((election) => {
      const alternatives = req.body.alternatives;
      if (alternatives && alternatives.length) {
        return Bluebird.map(alternatives, (alternative) => {
          alternative.election = election;
          return Alternative.create(alternative);
        }).then((createdAlternatives) => {
          election.alternatives = createdAlternatives;
          return election.save();
        });
      }

      return election;
    })
    .then((election) => election.populate('alternatives').execPopulate())
    .then((election) => res.status(201).json(election))
    .catch(mongoose.Error.ValidationError, (err) => {
      throw new errors.ValidationError(err.errors);
    });

exports.list = (req, res) =>
  Election.find()
    .populate('alternatives')
    .exec()
    .then((elections) => res.status(200).json(elections));

exports.retrieve = (req, res) =>
  req.election
    .populate('alternatives')
    .execPopulate()
    .then((election) => res.status(200).json(election));

function setElectionStatus(req, res, active) {
  req.election.active = active;
  return req.election.save();
}

exports.activate = async (req, res) => {
  const otherActiveElection = await Election.findOne({ active: true });
  if (otherActiveElection) {
    throw new errors.AlreadyActiveElectionError();
  }
  return setElectionStatus(req, res, true).then((election) => {
    const io = app.get('io');
    io.emit('election');
    return res.status(200).json(election);
  });
};

exports.deactivate = (req, res) =>
  setElectionStatus(req, res, false).then((election) => {
    const io = app.get('io');
    io.emit('election');
    res.status(200).json(election);
  });

exports.elect = (req, res) =>
  req.election.elect().then((result) => res.json(result));

exports.delete = (req, res) => {
  if (req.election.active) {
    throw new errors.ActiveElectionError('Cannot delete an active election.');
  }

  return req.election.remove().then(() =>
    res.status(200).json({
      message: 'Election deleted.',
      status: 200,
    })
  );
};

exports.count = (req, res) => {
  res.json({
    users: req.election.hasVotedUsers.length,
  });
};
