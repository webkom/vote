import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const alternativeSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  election: {
    type: Schema.Types.ObjectId,
    ref: 'Election',
  },
});

module.exports = mongoose.model('Alternative', alternativeSchema);
