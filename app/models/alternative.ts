import mongoose, { Schema } from 'mongoose';
import type { AlternativeType, AlternativeModel } from '../types/types';

const alternativeSchema = new Schema<AlternativeType, AlternativeModel>({
  description: {
    type: String,
    required: true,
  },
  election: {
    type: Schema.Types.ObjectId,
    ref: 'Election',
  },
});

export default mongoose.model<AlternativeType, AlternativeModel>(
  'Alternative',
  alternativeSchema
);
