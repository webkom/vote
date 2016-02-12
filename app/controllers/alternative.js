var mongoose = require('mongoose');
var Alternative = require('../models/alternative');
var errors = require('../errors');

exports.list = function(req, res, next) {
    return req.election.populate('alternatives').execPopulate()
        .then(function(election) {
            return res.json(election.alternatives);
        })
        .catch(next);
};

exports.create = function(req, res, next) {
    return req.election.populate('alternatives').execPopulate()
        .then(function(election) {
            if (election.active) {
                throw new errors.ActiveElectionError(
                    'Cannot create alternatives for active elections.'
                );
            }

            var alternative = new Alternative({
                title: req.body.title,
                description: req.body.description
            });

            return election.addAlternative(alternative);
        })
        .then(function(alternative) {
            return res.status(201).send(alternative);
        })
        .catch(mongoose.Error.ValidationError, function(err) {
            throw new errors.ValidationError(err.errors);
        })
        .catch(next);
};
