import mongoose, { Schema } from 'mongoose';
import { IElection } from './election';

export interface IVote extends Document {
  hash: string,
  election: IElection,
}

const voteSchema = new Schema<IVote>({
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
