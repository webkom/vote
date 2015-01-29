var Election = require('../models/election');

exports.create = function(req, res) {
    return Election.createAsync({
        title: req.body.title,
        description: req.body.description
    }).then(function(election) {
        return res.status(201).json(election);
    }).catch(function(err) {
        res.status(500).json(err);
    });
};

exports.list = function(req, res) {
    return Election.find()
        .populate('alternatives')
        .execAsync()
        .then(function(elections) {
            return res.status(200).json(elections);
        })
        .catch(function(err) {
            res.status(500).send(err);
        });
};

exports.retrieve = function(req, res) {
    return Election.findById(req.params.electionId)
        .populate('alternatives')
        .execAsync()
        .then(function(election) {
            if (!election) return res.status(404).send({ message: 'Election not found' });
            return res.status(200).json(election);
        })
        .catch(function(err) {
            res.status(500).send(err);
        });
};

exports.activate = function(req, res) {
    Election.findById(req.params.electionId)
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
    Election.findById(req.params.electionId)
        .exec(function(err, election) {
            if (!election) return res.status(404).send({ message: 'Election not found' });
            election.active = false;
            election.save(function(err, election) {
                if (err) return res.status(500).send(err);
                return res.status(200).json(election);
            });
        });
};
