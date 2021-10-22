import mongoose from 'mongoose';
import Alternative from '../models/alternative';
import errors from '../errors';

export const list = (req, res) =>
  req.election
    .populate('alternatives')
    .execPopulate()
    .then((election) => res.json(election.alternatives));

export const create = (req, res) =>
  req.election
    .populate('alternatives')
    .execPopulate()
    .then((election) => {
      if (election.active) {
        throw new errors.ActiveElectionError(
          'Cannot create alternatives for active elections.'
        );
      }

      const alternative = new Alternative({
        title: req.body.title,
        description: req.body.description,
      });

      return election.addAlternative(alternative);
    })
    .then((alternative) => res.status(201).send(alternative))
    .catch(err => {
      if (err instanceof mongoose.Error.ValidationError) {
        throw new errors.ValidationError(err.errors);
      }
    });
