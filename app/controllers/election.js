var mongoose = require('mongoose');
var Election = require('../models/election');
var errors = require('../errors');

exports.create = function(req, res) {
    return Election.createAsync({
        title: req.body.title,
        description: req.body.description
    }).then(function(election) {
        return res.status(201).json(election);
    }).catch(function(err) {
        return errors.handleError(res, err);
    });
};

exports.list = function(req, res) {
    return Election.find()
        .populate('alternatives')
        .execAsync()
        .then(function(elections) {
            return res.status(200).json(elections);
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};

var retrieveOr404 = exports.retrieveOr404 = function(req, res, populate) {
    function retrieve() {
        if (populate) {
            return Election.findById(req.params.electionId).populate(populate);
        }
        return Election.findById(req.params.electionId);
    }

    return retrieve()
        .execAsync()
        .then(function(election) {
            if (!election) throw new errors.NotFoundError('election');
            return election;
        })
        .catch(mongoose.Error.CastError, function(err) {
            throw new errors.NotFoundError('election');
        });
};

exports.retrieve = function(req, res) {
    return retrieveOr404(req, res, 'alternatives')
        .then(function(election) {
            return res.status(200).json(election);
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};

exports.activate = function(req, res) {
    return retrieveOr404(req, res)
        .then(function(election) {
            election.active = true;
            return election.saveAsync();
        })
        .spread(function(election) {
            return res.status(200).json(election);
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};

exports.deactivate = function(req, res) {
    return retrieveOr404(req, res)
        .then(function(election) {
            election.active = false;
            return election.saveAsync();
        })
        .spread(function(election) {
            return res.status(200).json(election);
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};

exports.sumVotes = function(req, res) {
    return retrieveOr404(req, res)
        .then(function(election) {
            return election.sumVotes();
        })
        .then(function(alternatives) {
            return res.json(alternatives);
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};

exports.delete = function(req, res) {
    return retrieveOr404(req, res)
        .then(function(election) {
            if (election.active) {
                throw new errors.DeleteError('Cannot delete an active election.');
            }
            return election.removeAsync();
        })
        .then(function() {
            return res.status(200).json({
                message: 'Election deleted.',
                status: 200
            });
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};
