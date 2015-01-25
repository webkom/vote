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


electionSchema.methods.addAlternative = function(alternative, next) {
    var that = this;
    this.alternatives.push(alternative);
    alternative.election = that._id;
    alternative.save(function(err, res) {
        if (err) return next(err);
        that.save(next);
    });

};


module.exports = mongoose.model('Election', electionSchema);
