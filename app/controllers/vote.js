var Alternative = require('../models/alternative');

exports.create = function(req, res) {
    Alternative.findById(req.params.alternative_id)
        .populate('votes')
        .exec(function(err, alternative) {
            if (err) return res.status(500).json(err);
            alternative.addVote(req.body.username, function(err, alternative) {
                if (err) return res.status(500).send(err);
                return res.status(201).send(alternative.votes);
            });
        });
};

exports.list = function(req, res) {
    Alternative.findById(req.params.alternative_id)
        .populate('votes')
        .exec(function(err, alternative) {
            if (err) return res.status(500).send(err);
            return res.send(alternative.votes);
        });
};