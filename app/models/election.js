var Bluebird = require('bluebird');
var mongoose = Bluebird.promisifyAll(require('mongoose'));
var Vote = require('./vote');
var Schema = mongoose.Schema;

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
    }
});

electionSchema.pre('remove', function(next) {
    // Use mongoose.model getter to avoid circular dependencies
    return mongoose.model('Alternative').findAsync(this.alternatives)
        .then(function(alternatives) {
            return Bluebird.map(alternatives, function(alternative) {
                // Have to call remove on each document to activate Alternative's
                // remove-middleware
                return alternative.removeAsync();
            });
        }).nodeify(next);
});

electionSchema.methods.sumVotes = function() {
    return Bluebird.map(this.alternatives, function(alternativeId) {
        return Vote.findAsync({ alternative: alternativeId })
            .then(function(votes) {
                return {
                    alternative: alternativeId,
                    votes: votes.length
                };
            });
    });
};

electionSchema.methods.addAlternative = function(alternative) {
    this.alternatives.push(alternative);
    alternative.election = this._id;
    return alternative.saveAsync().bind(this)
        .spread(function(savedAlternative) {
            return this.saveAsync().return(savedAlternative);
        });
};

module.exports = mongoose.model('Election', electionSchema);
