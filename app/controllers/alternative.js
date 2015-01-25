var Alternative = require('../models/alternative');
var Election = require('../models/election');

exports.list = function(req, res) {
    Election.findById(req.params.election_id)
        .populate('alternatives')
        .exec(function(err, election) {
            if (err) return res.status(500).send(err);
            return res.json(election.alternatives);
        });
};

exports.create = function(req, res) {
    Election.findById(req.params.election_id)
        .populate('alternatives')
        .exec(function(err, election) {
            if (err) return res.status(500).send(err);

            var alternative = new Alternative({
                title: req.body.title,
                description: req.body.description
            });

            election.addAlternative(alternative, function(err, election) {
                if (err) return res.status(500).send(err);
                return res.status(201).send(election.alternatives);
            });
        });
};
