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
            if (!election) return errors.handleError(res, new Error('Election not found'), 404);
            return res.status(200).json(election);
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};

exports.activate = function(req, res) {
    Election.findByIdAsync(req.params.electionId)
        .then(function(election) {
            if (!election) return errors.handleError(res, new Error('Election not found'), 404);
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
    Election.findByIdAsync(req.params.electionId)
        .then(function(election) {
            if (!election) return errors.handleError(res, new Error('Election not found'), 404);
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
