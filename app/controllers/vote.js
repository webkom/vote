var Alternative = require('../models/alternative');
var Vote = require('../models/vote');
var errors = require('../errors');

exports.create = function(req, res) {
    return Alternative.findById(req.params.alternativeId)
        .populate('votes')
        .execAsync()
        .then(function(alternative) {
            return alternative.addVote(req.user);
        })
        .spread(function(vote) {
            return res.status(201).send(vote);
        })
        .catch(errors.InactiveUserError, function(err) {
            return errors.handleError(res, err);
        })
        .catch(errors.VoteError, function(err) {
            return errors.handleError(res, err);
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
