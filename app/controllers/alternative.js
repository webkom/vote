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

            return election.addAlternative(alternative)
            .then(function() {
                return res.status(201).send(alternative);
            });
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};
