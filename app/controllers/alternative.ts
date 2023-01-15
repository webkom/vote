import type { RequestHandler } from 'express';
import mongoose from 'mongoose';
import Alternative from '../models/alternative';
import errors from '../errors';
import type { ReqWithElection } from './election';

export const list: RequestHandler = async (req: ReqWithElection, res) => {
  const election = await req.election.populate('alternatives');
  return res.json(election.alternatives);
};

export const create: RequestHandler = async (req: ReqWithElection, res) => {
  try {
    const election = req.election;
    await election.populate('alternatives');

    if (election.active) {
      throw new errors.ActiveElectionError(
        'Cannot create alternatives for active elections.'
      );
    }

    const alternative = new Alternative({
      title: req.body.title,
      description: req.body.description,
    });

    await election.addAlternative(alternative);

    return res.status(201).send(alternative);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      throw new errors.ValidationError(err.errors);
    }
    throw err;
  }
};

export default { list, create };
