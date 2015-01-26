<<<<<<< HEAD
var crypto = require('crypto');
var mongoose = require('mongoose');
var Vote = require('./vote');
var User = require('./user');
var Election = require('../models/election');
=======
var Bluebird = require('bluebird');
var bcrypt = Bluebird.promisifyAll(require('bcryptjs'));
var mongoose = Bluebird.promisifyAll(require('mongoose'));

var Vote = require('./vote');
var User = require('./user');

>>>>>>> Rewrite the project to use Bluebird promises
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
    ],
    election: {
        type: Schema.Types.ObjectId, ref: 'Election',
        required: true
    }
});

<<<<<<< HEAD
alternativeSchema.methods.addVote = function(username) {
    return User.findOneAsync({ username: username }).bind(this)
    .then(function(user) {
        if (!user) throw new Error('No user with that username');
        if (!user.active) throw new Error('User not active');

        return Election.findByIdAsync(this.election)
    })
    .then(function(election) {
        if (!election.active) throw new Error('Election not active');

        var appSecret = process.env.APP_SECRET || 'dev_secret';
        var hash = crypto.createHash('sha512');
        hash.setEncoding('hex');
        hash.write(user.username);
        hash.write(appSecret);
        hash.end();
        var voteHash = hash.read();

        return Vote.find({ election: this.election, hash: voteHash })
        .then(function(votes) {
                if (votes.length) throw new Error('Already voted');
                var vote = new Vote({ hash: voteHash, election: that.election });
                that.votes.push(vote);
                vote.save(function(err, vote) {
                    if (err) return next(err);
                    that.save(next);
=======
alternativeSchema.methods.addVote = function(username) {
    return User.findOneAsync({username: username}).bind(this)
        .then(function(user) {
            if (!user) throw new Error('No user with that username');
            if (!user.active) throw new Error('User not active');

            return Vote.findAsync({election: this.election})
                .then(function(votes) {
                    return Bluebird.map(votes, function(vote) {
                        return bcrypt.compareAsync(user.username, vote.hash)
                        .then(function(result) {
                            if (result) throw new Error('Already voted.');
                        });
                    });
                })
                .then(function() {
                    return bcrypt.hashAsync(user.username, 5);
>>>>>>> Rewrite the project to use Bluebird promises
                });
        })
        .then(function(hash) {
            var vote = new Vote({hash: hash, election: this.election});
            this.votes.push(vote);
            return vote.saveAsync();
        })
        .then(function() {
            return this.saveAsync();
        });
<<<<<<< HEAD
    });

=======
};

alternativeSchema.methods.getVotes = function() {
    return Vote.findAsync({ alternative: this });
};

alternativeSchema.methods.addVotes = function(votes, next) {
    return Bluebird.map(votes, function(vote) {
        this.votes.push(vote);
        return vote.saveAsync();
    }.bind(this));
>>>>>>> Rewrite the project to use Bluebird promises
};

module.exports = mongoose.model('Alternative', alternativeSchema);
