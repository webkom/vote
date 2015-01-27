var Bluebird = require('bluebird');
var mongoose = Bluebird.promisifyAll(require('mongoose'));
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
    ],
    active: {
        type: Boolean,
        default: false
    }
});

electionSchema.methods.addAlternative = function(alternative) {
    this.alternatives.push(alternative);
    alternative.election = this._id;
    return alternative.saveAsync().bind(this)
        .then(function() {
            return this.saveAsync();
        });
};


module.exports = mongoose.model('Election', electionSchema);
