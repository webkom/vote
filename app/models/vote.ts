import mongoose, { Schema } from 'mongoose';
import type { VoteType } from '../types/types';

const voteSchema = new Schema<VoteType>({
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

export default mongoose.model('Vote', voteSchema);
