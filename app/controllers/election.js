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

exports.retrieve = function(req, res) {
    return Election.findById(req.params.electionId)
        .populate('alternatives')
        .execAsync()
        .then(function(election) {
            if (!election) throw new errors.NotFoundError('election');
            return res.status(200).json(election);
        })
        .catch(mongoose.Error.CastError, function(err) {
            throw new errors.NotFoundError('election');
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};

exports.activate = function(req, res) {
    Election.findByIdAsync(req.params.electionId)
        .then(function(election) {
            if (!election) throw new errors.NotFoundError('election');
            election.active = true;
            return election.saveAsync();
        })
        .spread(function(election) {
            return res.status(200).json(election);
        })
        .catch(mongoose.Error.CastError, function(err) {
            throw new errors.NotFoundError('election');
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};

exports.deactivate = function(req, res) {
    Election.findByIdAsync(req.params.electionId)
        .then(function(election) {
            if (!election) throw new errors.NotFoundError('election');
            election.active = false;
            return election.saveAsync();
        })
        .spread(function(election) {
            return res.status(200).json(election);
        })
        .catch(mongoose.Error.CastError, function(err) {
            throw new errors.NotFoundError('election');
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};

exports.sumVotes = function(req, res) {
    Election.findByIdAsync(req.params.electionId)
        .then(function(election) {
            if (!election) throw new errors.NotFoundError('election');
            return election.sumVotes();
        })
        .then(function(alternatives) {
            return res.json(alternatives);
        })
        .catch(mongoose.Error.CastError, function(err) {
            throw new errors.NotFoundError('election');
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};
