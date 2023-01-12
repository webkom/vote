import _ from 'lodash';
import bcrypt from 'bcryptjs';
import mongoose, { Schema, HydratedDocument } from 'mongoose';
import errors from '../errors';
import { UserType, UserModel, IUserMethods } from '../types/types';

export const userSchema = new Schema<UserType>({
  username: {
    type: String,
    index: true,
    required: true,
    unique: true,
    match: /^\w{5,}$/,
  },
  hash: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  moderator: {
    type: Boolean,
    default: false,
  },
  cardKey: {
    type: String,
    required: true,
    unique: true,
  },
});

userSchema.pre<UserType>('save', function (this, next) {
  // Usernames are case-insensitive, so store them in lowercase:
  this.username = this.username.toLowerCase();
  next();
});

userSchema.methods.getCleanUser = function () {
  const user = _.omit(this.toObject(), 'password', 'hash');
  return user;
};

userSchema.statics.findByUsername = function (username: string) {
  return this.findOne({ username: username.toLowerCase() });
};

userSchema.statics.register = function (body: UserType, password: string) {
  if (!password) throw new errors.InvalidRegistrationError('Missing password');
  return bcrypt
    .genSalt()
    .then((salt) => bcrypt.hash(password, salt))
    .then((hash) => this.create(Object.assign(body, { hash })));
};

userSchema.statics.authenticate = function (
  username: string,
  password: string
) {
  let _user: HydratedDocument<UserType, IUserMethods>;
  return this.findOne({ username })
    .then((user) => {
      _user = user;
      return user.authenticate(password);
    })
    .then((result: boolean) => {
      if (!result) {
        throw new errors.InvalidRegistrationError(
          'Incorrect username and/or password.'
        );
      }

      return _user;
    });
};

userSchema.methods.authenticate = function (this: UserType, password: string) {
  return bcrypt.compare(password, this.hash);
};

export default mongoose.model<UserType, UserModel>('User', userSchema);
