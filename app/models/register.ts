import mongoose, { Schema } from 'mongoose';

export interface IRegister extends Document {
  identifier: string,
  email: string,
  user: IUser,
}


const registerSchema = new Schema<IRegister>({
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
registerSchema.pre('remove', function (next) {
  mongoose
    .model('User')
    .findOne({ _id: this.user })
    .then((user) => user.remove())
    .nodeify(next);
});

export default mongoose.model('Register', registerSchema);
