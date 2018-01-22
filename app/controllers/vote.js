const mongoose = require('mongoose');
const Alternative = require('../models/alternative');
const Vote = require('../models/vote');
const errors = require('../errors');

exports.create = (req, res, next) => {
    const alternativeId = req.body.alternativeId;
    if (!alternativeId) {
        const error = new errors.InvalidPayloadError('alternativeId');
        return errors.handleError(res, error);
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
        })
        .catch(next);
};

exports.retrieve = (req, res, next) => {
    const hash = req.get('Vote-Hash');

    if (!hash) {
        const error = new errors.MissingHeaderError('Vote-Hash');
        return errors.handleError(res, error);
    }

    return Vote.findOne({ hash: hash })
        .populate('alternative')
        .exec()
        .then(vote => {
            if (!vote) throw new errors.NotFoundError('vote');
            return vote.alternative.populate('election').execPopulate()
                .then(alternative => res.json(vote));
        })
        .catch(next);
};
