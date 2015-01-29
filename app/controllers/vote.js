var Alternative = require('../models/alternative');

exports.create = function(req, res) {
    return Alternative.findById(req.params.alternativeId)
        .populate('votes')
        .execAsync()
        .then(function(alternative) {
            return alternative.addVote(req.user.username);
        })
        .spread(function(alternative) {
            return res.status(201).send(alternative.votes);
        })
        .catch(function(err) {
            res.status(500).json(err);
        });
};

exports.list = function(req, res) {
    return Alternative.findById(req.params.alternativeId)
        .populate('votes')
        .execAsync()
        .then(function(alternative) {
            return res.send(alternative.votes);
        })
        .catch(function(err) {
            res.status(500).json(err);
        });
};
