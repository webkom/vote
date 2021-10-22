import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const registerSchema = new Schema({
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
registerSchema.pre('remove', async (next) => {
  const user = await mongoose.model('User').findOne({ _id: this.user });
  await user.remove();
  next();
});

export default mongoose.model('Register', registerSchema);
