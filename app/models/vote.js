var Bluebird = require('bluebird');
var mongoose = Bluebird.promisifyAll(require('mongoose'));
var errors = require('../errors');
var createHash = require('./helpers').createHash;

var Schema = mongoose.Schema;

var voteSchema = new Schema({
    hash: {
        type: String,
        required: true,
        index: true
    },
    alternative: {
        type: Schema.Types.ObjectId, ref: 'Alternative',
        required: true
    }
});

voteSchema.statics.findByHash = Bluebird.method(function(hash, user) {
    if (!hash || !user) throw new errors.VoteError('Need a hash and a user to retrieve a vote');

    var checkHash = createHash(user.username);

    if (hash !== checkHash) throw new errors.NotFoundError('vote');

    return this.findOneAsync({ hash: hash });
});

module.exports = mongoose.model('Vote', voteSchema);
