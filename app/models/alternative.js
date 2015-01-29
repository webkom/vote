var crypto = require('crypto');
var mongoose = require('mongoose');
var Bluebird = require('bluebird');
var mongoose = Bluebird.promisifyAll(require('mongoose'));
var Election = require('./election');
var Vote = require('./vote');
var User = require('./user');

var Schema = mongoose.Schema;

var alternativeSchema = new Schema({
    description: {
        type: String,
        required: true
    },
    election: {
        type: Schema.Types.ObjectId, ref: 'Election',
        required: true
    }
});

alternativeSchema.methods.addVote = function(username) {
    var that = this;

    return User.findOneAsync({ username: username })
    .then(function(user) {
        if (!user) throw new Error('No user with that username');
        if (!user.active) throw new Error('User not active');

        return Election.findByIdAsync(that.election)
        .then(function(election) {
            if (!election.active) throw new Error('Election not active');

            var appSecret = process.env.APP_SECRET || 'dev_secret';
            var hash = crypto.createHash('sha512');
            hash.setEncoding('hex');
            hash.write(user.username);
            hash.write(appSecret);
            hash.end();
            var voteHash = hash.read();

            return Vote.findAsync({ alternative: that.id, hash: voteHash })
            .then(function(votes) {
                if (votes.length) throw new Error('Already voted');
                var vote = new Vote({ hash: voteHash, alternative: that.id });
                return vote.saveAsync();
            });
        });
    });
};

alternativeSchema.methods.getVotes = function() {
    return Vote.findAsync({ alternative: this });
};

module.exports = mongoose.model('Alternative', alternativeSchema);
