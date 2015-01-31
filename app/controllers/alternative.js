var mongoose = require('mongoose');
var Alternative = require('../models/alternative');
var Election = require('../models/election');
var errors = require('../errors');

exports.list = function(req, res) {
    return Election.findById(req.params.electionId)
        .populate('alternatives')
        .execAsync()
        .then(function(election) {
            if (!election) throw new errors.NotFoundError('election');
            return res.json(election.alternatives);
        })
        .catch(mongoose.Error.CastError, function(err) {
            throw new errors.NotFoundError('election');
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};

exports.create = function(req, res) {
    return Election.findById(req.params.electionId)
        .populate('alternatives')
        .execAsync()
        .then(function(election) {
            if (!election) throw new errors.NotFoundError('election');

            var alternative = new Alternative({
                title: req.body.title,
                description: req.body.description
            });

            return election.addAlternative(alternative);
        })
        .then(function(alternative) {
            return res.status(201).send(alternative);
        })
        .catch(mongoose.Error.CastError, function(err) {
            throw new errors.NotFoundError('election');
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};
