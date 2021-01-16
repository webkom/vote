const Bluebird = require('bluebird');
const mongoose = require('mongoose');
const Election = require('../models/election');
const User = require('../models/user');
const Alternative = require('../models/alternative');
const errors = require('../errors');
const app = require('../../app');

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
    .then((election) => {
      // There is no active election (that the user has not voted on)
      if (!election) {
        return res.sendStatus(404);
      }
      // If the user is active, then we can return the election right
      // away, since they have allready passed the access code prompt
      if (req.user.active) {
        return res.status(200).json(election);
      }
      // There is an active election that the user has not voted on
      // but they did not pass any (or the correct) access code,
      // so we return 403 which prompts a access code input field.
      else if (
        !req.query.accessCode ||
        election.accessCode !== Number(req.query.accessCode)
      ) {
        return res.sendStatus(403);
      }
      // There is an active election that the user and the user has
      // the correct access code. Therefore we activate the users
      // account (allowing them to vote), and return the elction.
      else {
        return User.findByIdAndUpdate(
          { _id: req.user._id },
          { active: true }
        ).then(res.status(200).json(election));
      }
    });

exports.create = (req, res) =>
  Election.create({
    title: req.body.title,
    description: req.body.description,
    seats: req.body.seats,
    useStrict: req.body.useStrict,
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

exports.activate = (req, res) =>
  setElectionStatus(req, res, true).then((election) => {
    const io = app.get('io');
    io.emit('election');
    return res.status(200).json(election);
  });

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
