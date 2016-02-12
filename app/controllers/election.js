var Bluebird = require('bluebird');
var mongoose = require('mongoose');
var Election = require('../models/election');
var Alternative = require('../models/alternative');
var errors = require('../errors');
var app = require('../../app');

exports.load = function(req, res, next, electionId) {
    return Election.findById(electionId)
        .then(function(election) {
            if (!election) throw new errors.NotFoundError('election');
            req.election = election;
        })
        .catch(mongoose.Error.CastError, function(err) {
            throw new errors.NotFoundError('election');
        }).nodeify(next);
};

exports.retrieveActive = function(req, res, next) {
    return Election
        .findOne({ active: true })
        .where('hasVotedUsers.user')
        .ne(req.user.id)
        .select('-hasVotedUsers')
        .populate('alternatives')
        .exec()
        .then(function(election) {
            res.status(200).json(election);
        }).catch(next);
};

exports.create = function(req, res, next) {
    return Election.create({
        title: req.body.title,
        description: req.body.description
    }).then(function(election) {
        var alternatives = req.body.alternatives;
        if (alternatives && alternatives.length) {
            return Bluebird.map(alternatives, function(alternative) {
                alternative.election = election;
                return Alternative.create(alternative);
            }).then(function(createdAlternatives) {
                election.alternatives = createdAlternatives;
                return election.save();
            });
        }

        return election;
    }).then(function(election) {
        return election.populate('alternatives').execPopulate();
    }).then(function(election) {
        return res.status(201).json(election);
    }).catch(mongoose.Error.ValidationError, function(err) {
        throw new errors.ValidationError(err.errors);
    }).catch(next);
};

exports.list = function(req, res, next) {
    return Election.find()
        .populate('alternatives')
        .exec()
        .then(function(elections) {
            return res.status(200).json(elections);
        })
        .catch(next);
};

exports.retrieve = function(req, res, next) {
    return req.election.populate('alternatives').execPopulate()
        .then(function(election) {
            return res.status(200).json(election);
        })
        .catch(next);
};

function setElectionStatus(req, res, active) {
    req.election.active = active;
    return req.election.save();
}

exports.activate = function(req, res, next) {
    setElectionStatus(req, res, true)
        .then(function(election) {
            var io = app.get('io');
            io.emit('election');
            return res.status(200).json(election);
        })
        .catch(next);
};

exports.deactivate = function(req, res, next) {
    setElectionStatus(req, res, false)
        .then(function(election) {
            return res.status(200).json(election);
        })
        .catch(next);
};

exports.sumVotes = function(req, res, next) {
    return req.election.sumVotes()
        .then(function(alternatives) {
            return res.json(alternatives);
        })
        .catch(next);
};

exports.delete = function(req, res, next) {
    if (req.election.active) {
        throw new errors.ActiveElectionError('Cannot delete an active election.');
    }

    return req.election.remove()
        .then(function() {
            return res.status(200).json({
                message: 'Election deleted.',
                status: 200
            });
        })
        .catch(next);
};

exports.count = function(req, res) {
    res.json({
        users: req.election.hasVotedUsers.length
    });
};
