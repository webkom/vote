const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const registerSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  active: {
    type: Boolean,
    defeault: false,
  },
});

module.exports = mongoose.model('Register', registerSchema);
