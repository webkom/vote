import mongoose, { Schema } from 'mongoose';
import { IElection } from './election';

export interface IAlternative extends Document {
  description: string,
  election: IElection,
}

const alternativeSchema = new Schema<IAlternative>({
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
