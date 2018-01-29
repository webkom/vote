const Bluebird = require('bluebird');
const mongoose = require('mongoose');
const Election = require('../models/election');
const Alternative = require('../models/alternative');
const errors = require('../errors');
const app = require('../../app');

exports.load = (req, res, next, electionId) =>
  Election.findById(electionId)
    .then(election => {
      if (!election) throw new errors.NotFoundError('election');
      req.election = election;
      next();
    })
    .catch(mongoose.Error.CastError, err => {
      throw new errors.NotFoundError('election');
    });

exports.retrieveActive = (req, res) =>
  Election.findOne({ active: true })
    .where('hasVotedUsers.user')
    .ne(req.user.id)
    .select('-hasVotedUsers')
    .populate('alternatives')
    .exec()
    .then(election => {
      res.status(200).json(election);
    });

exports.create = (req, res) =>
  Election.create({
    title: req.body.title,
    description: req.body.description
  })
    .then(election => {
      const alternatives = req.body.alternatives;
      if (alternatives && alternatives.length) {
        return Bluebird.map(alternatives, alternative => {
          alternative.election = election;
          return Alternative.create(alternative);
        }).then(createdAlternatives => {
          election.alternatives = createdAlternatives;
          return election.save();
        });
      }

      return election;
    })
    .then(election => election.populate('alternatives').execPopulate())
    .then(election => res.status(201).json(election))
    .catch(mongoose.Error.ValidationError, err => {
      throw new errors.ValidationError(err.errors);
    });

exports.list = (req, res) =>
  Election.find()
    .populate('alternatives')
    .exec()
    .then(elections => res.status(200).json(elections));

exports.retrieve = (req, res) =>
  req.election
    .populate('alternatives')
    .execPopulate()
    .then(election => res.status(200).json(election));

function setElectionStatus(req, res, active) {
  req.election.active = active;
  return req.election.save();
}

exports.activate = (req, res) =>
  setElectionStatus(req, res, true).then(election => {
    const io = app.get('io');
    io.emit('election');
    return res.status(200).json(election);
  });

exports.deactivate = (req, res) =>
  setElectionStatus(req, res, false).then(election =>
    res.status(200).json(election)
  );

exports.sumVotes = (req, res) =>
  req.election.sumVotes().then(alternatives => res.json(alternatives));

exports.delete = (req, res) => {
  if (req.election.active) {
    throw new errors.ActiveElectionError('Cannot delete an active election.');
  }

  return req.election.remove().then(() =>
    res.status(200).json({
      message: 'Election deleted.',
      status: 200
    })
  );
};

exports.count = (req, res) => {
  res.json({
    users: req.election.hasVotedUsers.length
  });
};
