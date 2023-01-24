import mongoose, { Schema } from 'mongoose';
import type { RegisterType } from '../types/types';

const registerSchema = new Schema<RegisterType>({
  identifier: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

// Delete the associated user when deleting a register entry
registerSchema.pre<RegisterType>('remove', async function (next) {
  const user = await mongoose.model('User').findOne({ _id: this.user });
  await user.remove();
  next();
});

export default mongoose.model('Register', registerSchema);
