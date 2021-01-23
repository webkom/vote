const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const registerSchema = new Schema({
  legoUser: {
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

module.exports = mongoose.model('Register', registerSchema);
