const Election = require('../models/election');
const Vote = require('../models/vote');
const errors = require('../errors');

const env = require('../../env');
const redisClient = require('redis').createClient(6379, env.REDIS_URL);
const Redlock = require('redlock');
const redlock = new Redlock([redisClient], {});

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
        throw new errors.InvalidPrioritiesLengthError(priorities, election);
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
    .then((vote) => res.json(vote));
};

exports.retrieve = async (req, res) => {
  const hash = req.get('Vote-Hash');

  if (!hash) {
    throw new errors.MissingHeaderError('Vote-Hash');
  }

  const vote = await Vote.findOne({ hash: hash })
    .populate('priorities')
    .populate('election');

  if (!vote) throw new errors.NotFoundError('vote');
  res.json(vote);
};
