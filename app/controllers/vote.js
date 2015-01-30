var mongoose = require('mongoose');
var Alternative = require('../models/alternative');
var Vote = require('../models/vote');
var errors = require('../errors');

exports.create = function(req, res) {
    var alternativeId = req.get('Alternative-Id');
    if (!alternativeId) {
        var error = new errors.MissingHeaderError('Alternative-Id');
        return errors.handleError(res, error);
    }

    if (!mongoose.Types.ObjectId.isValid(alternativeId)) {
        var idError = new errors.NotFoundError('alternative');
        return errors.handleError(res, idError);
    }

    return Alternative.findById(alternativeId)
        .populate('votes')
        .execAsync()
        .then(function(alternative) {
            if (!alternative) throw new errors.NotFoundError('alternative');
            return alternative.addVote(req.user);
        })
        .spread(function(vote) {
            return res.status(201).send(vote);
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};

exports.list = function(req, res) {
    return Vote.findAsync({ alternative: req.params.alternativeId })
        .then(function(votes) {
            return res.send(votes);
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};

exports.retrieve = function(req, res) {
    var hash = req.get('Vote-Hash');
    return Vote.findByHash(hash, req.user)
        .then(function(vote) {
            return res.send(vote);
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};
