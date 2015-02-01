var mongoose = require('mongoose');
var Alternative = require('../models/alternative');
var retrieveElectionOr404 = require('./election').retrieveOr404;
var errors = require('../errors');

exports.list = function(req, res) {
    return retrieveElectionOr404(req, res, 'alternatives')
        .then(function(election) {
            return res.json(election.alternatives);
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};

exports.create = function(req, res) {
    return retrieveElectionOr404(req, res, 'alternatives')
        .then(function(election) {
            var alternative = new Alternative({
                title: req.body.title,
                description: req.body.description
            });

            return election.addAlternative(alternative);
        })
        .then(function(alternative) {
            return res.status(201).send(alternative);
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};

exports.delete = function(req, res) {
    return retrieveElectionOr404(req, res, 'alternatives')
        .then(function(election) {
            if (election.active) {
                throw new errors.DeleteError('Cannot delete alternatives belonging to an active election.');
            }

            return Alternative.findByIdAsync(req.params.alternativeId);
        })
        .then(function(alternative) {
            if (!alternative) throw new errors.NotFoundError('alternative');
            return alternative.removeAsync();
        })
        .then(function() {
            return res.status(200).json({
                message: 'Alternative deleted.',
                status: 200
            });
        })
        .catch(mongoose.Error.CastError, function(err) {
            throw new errors.NotFoundError('alternative');
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};
