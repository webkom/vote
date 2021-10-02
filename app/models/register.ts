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
registerSchema.pre('remove', function (next) {
  mongoose
    .model('User')
    .findOne({ _id: this.user })
    .then((user) => user.remove())
    .nodeify(next);
});

module.exports = mongoose.model('Register', registerSchema);
