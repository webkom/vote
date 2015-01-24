var async = require('async');
var mongoose = require('mongoose');
var Vote = require('./vote');
var Schema = mongoose.Schema;

var alternativeSchema = new Schema({
    description: {
        type: String,
        required: true
    },
    votes: [
        {
            type: Schema.Types.ObjectId, ref: 'Vote'
        }
    ]
});

alternativeSchema.methods.getVotes = function(cb) {
    Vote.find({ alternative: this }, function (err, votes) {
        if (err) return cb(err);
        return cb(null, votes);
    });
};

alternativeSchema.methods.addVotes = function(votes, next) {
    async.each(votes, function(vote, cb) {
        this.votes.push(vote);
        vote.save(cb);
    }.bind(this), next);
};

module.exports = mongoose.model('Alternative', alternativeSchema);
