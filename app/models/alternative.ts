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

export default mongoose.model('Alternative', alternativeSchema);
