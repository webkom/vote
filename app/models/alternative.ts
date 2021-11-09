import mongoose, { Schema } from 'mongoose';
import { AlternativeType } from '../types/types';

const alternativeSchema = new Schema<AlternativeType>({
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
