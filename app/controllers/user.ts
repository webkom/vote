import mongoose from 'mongoose';
import User, { IUser } from '../models/user';
import Register from '../models/register';
import errors from '../errors';
import { BadRequestError, DuplicateError } from '../errors/error-checks';
import crypto from 'crypto';
import { mailHandler } from '../digital/mail';
import short from 'short-uuid';
import { RequestHandler } from 'express';

export const count : RequestHandler = async (req, res) => {
  const query : mongoose.FilterQuery<IUser> = { admin: false, moderator: false };
  if (req.query.active === 'true') {
    query.active = true;
  } else if (req.query.active === 'false') {
    query.active = false;
  }

  const count = await User.countDocuments(query);
  res.json({ users: count });
};

export const list : RequestHandler  = async (req, res) => {
  const users = await User.find({}, 'username admin active moderator');
  res.json(users);
};

export const create : RequestHandler = (req, res) => {
  const user = new User(req.body);
  return User.register(user, req.body.password)
    .then((createdUser) => res.status(201).json(createdUser.getCleanUser()))
    .catch(mongoose.Error.ValidationError, (err) => {
      throw new errors.ValidationError(err.errors);
    })
    .catch(DuplicateError, (err) => {
      if (err.message.includes('cardKey')) {
        throw new errors.DuplicateCardError();
      }

      throw new errors.DuplicateUsernameError();
    })
    .catch(BadRequestError, (err) => {
      throw new errors.InvalidRegistrationError(err.message);
    });
};

export const generate : RequestHandler = async (req, res) => {
  const { identifier, email, ignoreExistingUser } = req.body;

  if (!identifier) throw new errors.InvalidPayloadError('identifier');
  if (!email) throw new errors.InvalidPayloadError('email');

  // Try to fetch an entry from the register with this username
  const entry = await Register.findOne({ identifier }).exec();

  if (entry && ignoreExistingUser) {
    return res.status(409).json(identifier);
  }

  // Entry has no user this user is allready activated
  if (entry && !entry.user) {
    return mailHandler('reject', { email })
      .then(() =>
        res.status(409).json({
          status: 'allready signed in',
          user: identifier,
        })
      )
      .catch((err) => {
        throw new errors.MailError(err);
      });
  }

  const password = crypto.randomBytes(11).toString('hex');

  // Entry has a user but has not activated
  if (entry && entry.user) {
    const fetchedUser = await User.findByIdAndUpdate({ _id: entry.user });
    // Use the register function to "re-register" the user with a new password
    return User.register(fetchedUser, password).then((updatedUser) =>
      mailHandler('resend', { email, username: updatedUser.username, password })
        .then(() => {
          entry.email = email;
          return entry.save();
        })
        .then(() =>
          res.status(201).json({
            status: 'regenerated',
            user: identifier,
          })
        )
        .catch((err) => {
          throw new errors.MailError(err);
        })
    );
  }

  // The user does not exist, so we generate as usual
  const username = short.generate();
  const cardKey = short.generate();
  const userObject = {
    username,
    password,
    cardKey,
    active: false,
  };

  const user = new User(userObject);
  return User.register(user, password)
    .then((createdUser) =>
      mailHandler('send', { email, username: createdUser.username, password })
        .then(() => new Register({ identifier, email, user }).save())
        .then(() =>
          res.status(201).json({ status: 'generated', user: identifier })
        )
        .catch((err) => {
          throw new errors.MailError(err);
        })
    )
    .catch(mongoose.Error.ValidationError, (err) => { // TODO: Gå vekk fra bluebird og bruk Promise istedet (instanceof istedet for flere catches)
      throw new errors.ValidationError(err.errors);
    })
    .catch(DuplicateError, (err) => {
      if (err.message.includes('cardKey')) {
        throw new errors.DuplicateCardError();
      }

      throw new errors.DuplicateUsernameError();
    })
    .catch(BadRequestError, (err) => {
      throw new errors.InvalidRegistrationError(err.message);
    });
};

export const toggleActive : RequestHandler = async (req, res) => {
  const user = await User.findOne({ cardKey: req.params.cardKey });
  if (!user) {
    throw new errors.NotFoundError('user');
  }

  user.active = !user.active;
  const saved = await user.save();
  res.json(saved);
};

export const changeCard : RequestHandler = (req, res) =>
  User.authenticate(req.params.username, req.body.password)
    .then((user) => {
      user.cardKey = req.body.cardKey;
      return user.save();
    })
    .then((user) => {
      res.json(user);
    })
    .catch(DuplicateError, () => {
      throw new errors.DuplicateCardError();
    });

export const deactivateAllNonAdmin : RequestHandler = async (req, res) => {
  await User.updateMany(
    { admin: false, moderator: false },
    { active: false },
    { multi: true }
  );
  res.status(200).json({
    message: 'Users deactivated.',
    status: 200,
  });
};

export default user;