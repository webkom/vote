const Election = require('../models/election');
const Vote = require('../models/vote');
const errors = require('../errors');

exports.create = async (req, res) => {
  const { election, priorities } = req.body;

  if (typeof election !== 'object' || Array.isArray(election)) {
    throw new errors.InvalidPayloadError('election');
  }

  if (!Array.isArray(priorities)) {
    throw new errors.InvalidPayloadError('priorities');
  }

  return Election.findById(req.body.election._id)
    .then((election) => {
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

      return election.addVote(req.user, priorities);
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
