const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const voteSchema = new Schema({
  hash: {
    type: String,
    required: true,
    index: true
  },
  alternative: {
    type: Schema.Types.ObjectId,
    ref: 'Alternative'
  }
});

module.exports = mongoose.model('Vote', voteSchema);
