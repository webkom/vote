const mongoose = require('mongoose');
const Alternative = require('../models/alternative');
const Vote = require('../models/vote');
const errors = require('../errors');

exports.create = (req, res) => {
  const alternativeId = req.body.alternativeId;
  if (!alternativeId) {
    throw new errors.InvalidPayloadError('alternativeId');
  }

  return Alternative.findById(alternativeId)
    .populate('votes')
    .exec()
    .then(alternative => {
      if (!alternative) throw new errors.NotFoundError('alternative');
      return alternative.addVote(req.user);
    })
    .then(vote => vote.populate('alternative').execPopulate())
    .then(vote => res.status(201).send(vote))
    .catch(mongoose.Error.CastError, err => {
      throw new errors.NotFoundError('alternative');
    });
};

exports.retrieve = async (req, res) => {
  const hash = req.get('Vote-Hash');

  if (!hash) {
    throw new errors.MissingHeaderError('Vote-Hash');
  }

  const vote = await Vote.findOne({ hash: hash }).populate({
    path: 'alternative',
    populate: { path: 'election', select: 'title _id' }
  });

  if (!vote) throw new errors.NotFoundError('vote');
  res.json(vote);
};
