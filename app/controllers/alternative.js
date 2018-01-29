const mongoose = require('mongoose');
const Alternative = require('../models/alternative');
const errors = require('../errors');

exports.list = (req, res) =>
  req.election
    .populate('alternatives')
    .execPopulate()
    .then(election => res.json(election.alternatives));

exports.create = (req, res) =>
  req.election
    .populate('alternatives')
    .execPopulate()
    .then(election => {
      if (election.active) {
        throw new errors.ActiveElectionError(
          'Cannot create alternatives for active elections.'
        );
      }

      const alternative = new Alternative({
        title: req.body.title,
        description: req.body.description
      });

      return election.addAlternative(alternative);
    })
    .then(alternative => res.status(201).send(alternative))
    .catch(mongoose.Error.ValidationError, err => {
      throw new errors.ValidationError(err.errors);
    });
