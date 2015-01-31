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
            return errors.handleError(res, err, 403);
        })
        .catch(errors.VoteError, function(err) {
            return errors.handleError(res, err, 400);
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
