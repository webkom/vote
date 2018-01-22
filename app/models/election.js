var Bluebird = require('bluebird');
var errors = require('../errors');
var mongoose = require('mongoose');
var Vote = require('./vote');
var Schema = mongoose.Schema;

var hasVotedSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

var electionSchema = new Schema({
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
        .then(function(alternatives) {
            return Bluebird.map(alternatives, function(alternative) {
                // Have to call remove on each document to activate Alternative's
                // remove-middleware
                return alternative.remove();
            });
        }).nodeify(next);
});

electionSchema.methods.sumVotes = function() {
    if (this.active) {
        throw new errors.ActiveElectionError(
            'Cannot retrieve results on an active election.'
        );
    }

    return Bluebird.map(this.alternatives, function(alternativeId) {
        return Vote.find({ alternative: alternativeId })
            .then(function(votes) {
                return {
                    alternative: alternativeId,
                    votes: votes.length
                };
            });
    });
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
