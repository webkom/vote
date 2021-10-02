import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const voteSchema = new Schema({
  hash: {
    type: String,
    required: true,
    index: true,
  },
  election: {
    type: Schema.Types.ObjectId,
    ref: 'Election',
  },
  priorities: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Alternative',
    },
  ],
});

module.exports = mongoose.model('Vote', voteSchema);
