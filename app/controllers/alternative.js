var Alternative = require('../models/alternative');
var Election = require('../models/election');

exports.list = function(req, res) {
    return Election.findById(req.params.election_id)
        .populate('alternatives')
        .execAsync()
        .then(function(election) {
            return res.json(election.alternatives);
        })
        .catch(function(err) {
            res.status(500).json(err);
        });
};

exports.create = function(req, res) {
    return Election.findById(req.params.election_id)
        .populate('alternatives')
        .execAsync()
        .then(function(election) {
            var alternative = new Alternative({
                title: req.body.title,
                description: req.body.description
            });

            return election.addAlternative(alternative)
            .then(function() {
                return res.status(201).send(alternative);
            });
        })
        .catch(function(err) {
            res.status(500).send(err);
        });
};
