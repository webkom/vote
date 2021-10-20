import _ from 'lodash';
import Bluebird from 'bluebird';
import bcrypt from 'bcryptjs';
import mongoose, { Model, Schema, Document } from 'mongoose';
import errors from '../errors';


export interface IUser extends Document {
  username: string;
  hash: string;
  active: boolean;
  admin: boolean;
  moderator: boolean;
  cardKey: string;


  // methods
  getCleanUser() : IUser;
  authenticate(password : string) : Promise<boolean>;
}

export interface UserModel extends Model<IUser> {
  // statics
  authenticate(username : string, password : string) : Promise<IUser>;
  findByUsername(username : string) : Promise<IUser>;
  register(body : IUser, password : string) : Promise<IUser>;
}

const userSchema = new Schema({
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

userSchema.pre<IUser>('save', function (this, next) {
  // Usernames are case-insensitive, so store them in lowercase:
  this.username = this.username.toLowerCase();
  next();
});

userSchema.methods.getCleanUser = function () {
  const user = _.omit(this.toObject(), 'password', 'hash');
  return user;
};

userSchema.statics.findByUsername = function (username : string) {
  return this.findOne({ username: username.toLowerCase() });
};

userSchema.statics.register = function (body : IUser, password : string) {
  if (!password) throw new errors.InvalidRegistrationError('Missing password');
  // The controller expects a Bluebird promise, so we wrap it in resolve:
  return Bluebird.resolve(bcrypt.genSalt())
    .then((salt) => bcrypt.hash(password, salt))
    .then((hash) => this.create(Object.assign(body, { hash })));
};

userSchema.statics.authenticate = function (username : string, password : string) {
  let _user : IUser;
  return this.findOne({ username })
    .then((user : IUser) => {
      _user = user;
      return user.authenticate(password);
    })
    .then((result : boolean) => {
      if (!result) {
        throw new errors.InvalidRegistrationError(
          'Incorrect username and/or password.'
        );
      }

      return _user;
    });
};

userSchema.methods.authenticate = function (this : IUser, password : string) {
  // The controller expects a Bluebird promise, so we wrap it in resolve:
  return Bluebird.resolve(bcrypt.compare(password, this.hash));
};

export default mongoose.model<IUser, UserModel>('User', userSchema);
