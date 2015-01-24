var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var voteSchema = new Schema({
    hash: {
        type: String,
        required: true,
        index: true
    },
    election: {
        type: Schema.Types.ObjectId, ref: 'Election',
        required: true
    }
});

module.exports = mongoose.model('Vote', voteSchema);
