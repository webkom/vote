const Bluebird = require('bluebird');
const errors = require('../errors');
const mongoose = require('mongoose');
const Vote = require('./vote');
const Schema = mongoose.Schema;

const hasVotedSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

const electionSchema = new Schema({
    title: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String
    },
    alternatives: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Alternative'
        }
    ],
    active: {
        type: Boolean,
        default: false
    },
    hasVotedUsers: [hasVotedSchema]
});

electionSchema.pre('remove', function(next) {
    // Use mongoose.model getter to avoid circular dependencies
    return mongoose.model('Alternative').find({ election: this.id })
        .then(alternatives => Bluebird.map(alternatives, alternative => // Have to call remove on each document to activate Alternative's
    // remove-middleware
    alternative.remove())).nodeify(next);
});

electionSchema.methods.sumVotes = function() {
    if (this.active) {
        throw new errors.ActiveElectionError(
            'Cannot retrieve results on an active election.'
        );
    }

    return Bluebird.map(this.alternatives, alternativeId => Vote.find({ alternative: alternativeId })
        .then(votes => ({
        alternative: alternativeId,
        votes: votes.length
    })));
};

electionSchema.methods.addAlternative = function(alternative) {
    this.alternatives.push(alternative._id);
    alternative.election = this._id;
    return alternative.save().bind(this)
        .then(function(savedAlternative) {
            return this.save().return(savedAlternative);
        });
};

module.exports = mongoose.model('Election', electionSchema);
