import type { RequestHandler } from 'express';
import Client from 'ioredis';
import Redlock from 'redlock';

import Election from '../models/election';
import Vote from '../models/vote';
import errors from '../errors';
import env from '../../env';
import ElectionTypes from '../models/utils';

const redisClient = new Client(6379, env.REDIS_URL);
const redlock = new Redlock([redisClient], {});

export const create: RequestHandler = async (req, res) => {
  const { election, priorities } = req.body;
  const { user } = req;

  if (typeof election !== 'object' || Array.isArray(election)) {
    throw new errors.InvalidPayloadError('election');
  }

  if (!Array.isArray(priorities)) {
    throw new errors.InvalidPayloadError('priorities');
  }

  // Create a new lock for this user to ensure nobody double-votes
  const lock = await redlock.acquire(['vote:' + user._id], 1000);
  return Election.findById(req.body.election._id)
    .then(async (election) => {
      // Election does not exist
      if (!election) throw new errors.NotFoundError('election');

      // Priorities cant be longer then alternatives
      if (priorities.length > election.alternatives.length) {
        throw new errors.InvalidSTVPrioritiesLengthError(priorities, election);
      }

      // If this is a normal election, then the ballot can only contain 0 or 1 priorities
      if (election.type === ElectionTypes.NORMAL && priorities.length > 1) {
        throw new errors.InvalidNormalPrioritiesLengthError(priorities);
      }

      // Payload has priorites that are not in the election alternatives
      const diff = priorities.filter(
        (x) => !election.alternatives.includes(x._id)
      );
      if (diff.length > 0) {
        throw new errors.InvalidPriorityError(diff[0], election.title);
      }
      const vote = await election.addVote(user, priorities);
      // Unlock when voted
      await lock.release();

      return vote;
    })
    .then((vote) => res.status(201).json(vote));
};

export const retrieve: RequestHandler = async (req, res) => {
  const hash = req.get('Vote-Hash');

  if (!hash) {
    throw new errors.MissingHeaderError('Vote-Hash');
  }

  const vote = await Vote.findOne({ hash: hash }).populate([
    { path: 'priorities' },
    { path: 'election', select: 'title _id' },
  ]);

  if (!vote) throw new errors.NotFoundError('vote');
  res.status(200).json(vote);
};
