const Bluebird = require('bluebird');
const mongoose = require('mongoose');
const Election = require('../models/election');
const Alternative = require('../models/alternative');
const errors = require('../errors');
const app = require('../../app');

exports.load = (req, res, next, electionId) => Election.findById(electionId)
    .then(election => {
        if (!election) throw new errors.NotFoundError('election');
        req.election = election;
    })
    .catch(mongoose.Error.CastError, err => {
        throw new errors.NotFoundError('election');
    }).nodeify(next);

exports.retrieveActive = (req, res, next) => Election
    .findOne({ active: true })
    .where('hasVotedUsers.user')
    .ne(req.user.id)
    .select('-hasVotedUsers')
    .populate('alternatives')
    .exec()
    .then(election => {
        res.status(200).json(election);
    }).catch(next);

exports.create = (req, res, next) => Election.create({
    title: req.body.title,
    description: req.body.description
}).then(election => {
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
}).then(election => election.populate('alternatives').execPopulate()).then(election => res.status(201).json(election)).catch(mongoose.Error.ValidationError, err => {
    throw new errors.ValidationError(err.errors);
}).catch(next);

exports.list = (req, res, next) => Election.find()
    .populate('alternatives')
    .exec()
    .then(elections => res.status(200).json(elections))
    .catch(next);

exports.retrieve = (req, res, next) => req.election.populate('alternatives').execPopulate()
    .then(election => res.status(200).json(election))
    .catch(next);

function setElectionStatus(req, res, active) {
    req.election.active = active;
    return req.election.save();
}

exports.activate = (req, res, next) => {
    setElectionStatus(req, res, true)
        .then(election => {
            const io = app.get('io');
            io.emit('election');
            return res.status(200).json(election);
        })
        .catch(next);
};

exports.deactivate = (req, res, next) => {
    setElectionStatus(req, res, false)
        .then(election => res.status(200).json(election))
        .catch(next);
};

exports.sumVotes = (req, res, next) => req.election.sumVotes()
    .then(alternatives => res.json(alternatives))
    .catch(next);

exports.delete = (req, res, next) => {
    if (req.election.active) {
        throw new errors.ActiveElectionError('Cannot delete an active election.');
    }

    return req.election.remove()
        .then(() => res.status(200).json({
        message: 'Election deleted.',
        status: 200
    }))
        .catch(next);
};

exports.count = (req, res) => {
    res.json({
        users: req.election.hasVotedUsers.length
    });
};
