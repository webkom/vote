import Election from '../models/election';
import Vote from '../models/vote';
import errors from '../errors';
import env from '../../env';
const redisClient = require('redis').createClient(6379, env.REDIS_URL);
import Redlock from 'redlock';
const redlock = new Redlock([redisClient], {});
const ElectionTypes = require('../models/utils.js');

exports.create = async (req, res) => {
  const { election, priorities } = req.body;
  const { user } = req;

  if (typeof election !== 'object' || Array.isArray(election)) {
    throw new errors.InvalidPayloadError('election');
  }

  if (!Array.isArray(priorities)) {
    throw new errors.InvalidPayloadError('priorities');
  }

  // Create a new lock for this user to ensure nobody double-votes
  const lock = await redlock.lock('vote:' + user._id, 1000);
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
        throw new errors.InvalidPriorityError(diff[0], election);
      }
      const vote = await election.addVote(user, priorities);
      // Unlock when voted
      await lock.unlock();

      return vote;
    })
    .then((vote) => res.status(201).json(vote));
};

exports.retrieve = async (req, res) => {
  const hash = req.get('Vote-Hash');

  if (!hash) {
    throw new errors.MissingHeaderError('Vote-Hash');
  }

  const vote = await Vote.findOne({ hash: hash })
    .populate('priorities')
    .populate('election', 'title _id');

  if (!vote) throw new errors.NotFoundError('vote');
  res.status(200).json(vote);
};
