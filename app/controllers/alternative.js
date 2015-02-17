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
            if (election.active) {
                throw new errors.ActiveElectionError('Cannot create alternatives for active elections.');
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
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};
