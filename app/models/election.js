var async = require('async');
var mongoose = require('mongoose');
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
            type: Schema.Types.ObjectId, ref: 'Alternative'
        }
    ]
});

electionSchema.methods.addAlternatives = function(alternatives, next) {
    var that = this;
    async.each(alternatives, function(alt, cb) {
        that.alternatives.push(alt);
        alt.save(cb);
    }, function() {
        that.save(next);
    });
};

module.exports = mongoose.model('Election', electionSchema);
