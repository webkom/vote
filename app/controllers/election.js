var Election = require('../models/election');

exports.create = function(req, res) {
    Election.create({
        title: req.body.title,
        description: req.body.description
    }, function(err, election) {
        if (err) return res.status(500).send(err);
        return res.status(201).json(election);
    });
};

exports.list = function(req, res) {
    Election.find()
        .populate('alternatives')
        .exec(function(err, elections) {
            if (err) return res.status(500).send(err);
            return res.status(200).json(elections);
        });
};

exports.retrieve = function(req, res) {
    Election.findById(req.params.election_id)
        .populate('alternatives')
        .exec(function(err, election) {
            if (!election) return res.status(404).send({ message: 'Election not found' });
            if (err) return res.status(500).send(err);
            return res.status(200).json(election);
        });
};

exports.activate = function(req, res) {
    Election.findById(req.params.election_id)
        .exec(function(err, election) {
            if (!election) return res.status(404).send({ message: 'Election not found' });
            election.active = true;
            election.save(function(err, election) {
                if (err) return res.status(500).send(err);
                return res.status(200).json(election);
            });
        });
};

exports.deactivate = function(req, res) {
    Election.findById(req.params.election_id)
        .exec(function(err, election) {
            if (!election) return res.status(404).send({ message: 'Election not found' });
            election.active = false;
            election.save(function(err, election) {
                if (err) return res.status(500).send(err);
                return res.status(200).json(election);
            });
        });
};
