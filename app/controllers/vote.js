var Alternative = require('../models/alternative');
var Vote = require('../models/vote');

exports.create = function(req, res) {
    return Alternative.findById(req.params.alternativeId)
        .populate('votes')
        .execAsync()
        .then(function(alternative) {
            return alternative.addVote(req.user.username);
        })
        .spread(function(vote) {
            return res.status(201).send(vote);
        })
        .catch(function(err) {
            res.status(500).json(err);
        });
};

exports.list = function(req, res) {
    return Vote.findAsync({ alternative: req.params.alternativeId })
        .then(function(votes) {
            return res.send(votes);
        })
        .catch(function(err) {
            res.status(500).json(err);
        });
};
