import mongoose from 'mongoose';
import User from '../models/user';
import Register from '../models/register';
import errors from '../errors';
import { badRequestError, duplicateError } from '../errors/error-checks';
import crypto from 'crypto';
import { mailHandler, MailAction } from '../digital/mail';
import short from 'short-uuid';
import { RequestHandler } from 'express';
import { UserType } from '../types/types';

export const count: RequestHandler = async (req, res) => {
  const query: mongoose.FilterQuery<UserType> = {
    admin: false,
    moderator: false,
  };
  if (req.query.active === 'true') {
    query.active = true;
  } else if (req.query.active === 'false') {
    query.active = false;
  }

  const count = await User.countDocuments(query);
  res.json({ users: count });
};

export const list: RequestHandler = async (req, res) => {
  const users = await User.find({}, 'username admin active moderator');
  res.json(users);
};

export const create: RequestHandler = (req, res) => {
  const user = new User(req.body);
  return User.register(user, req.body.password)
    .then((createdUser) => res.status(201).json(createdUser.getCleanUser()))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        throw new errors.ValidationError(err.errors);
      }

      if (duplicateError(err)) {
        if (err.message.includes('cardKey')) {
          throw new errors.DuplicateCardError();
        }
        throw new errors.DuplicateUsernameError();
      }

      if (badRequestError(err)) {
        throw new errors.InvalidRegistrationError(err.message);
      }
      throw err;
    });
};

interface MailRequestBody {
  identifier: string;
  email: string;
  ignoreExistingUser: boolean;
}

type MailResponseBody =
  | string
  | {
      status: string;
      user: string;
    };

export const generate: RequestHandler<
  Record<string, never>,
  MailResponseBody,
  MailRequestBody
> = async (req, res) => {
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
    return mailHandler(MailAction.REJECT, { email })
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
      mailHandler(MailAction.RESEND, {
        email,
        username: updatedUser.username,
        password,
      })
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
      mailHandler(MailAction.SEND, {
        email,
        username: createdUser.username,
        password,
      })
        .then(() => new Register({ identifier, email, user }).save())
        .then(() =>
          res.status(201).json({ status: 'generated', user: identifier })
        )
        .catch((err) => {
          throw new errors.MailError(err);
        })
    )
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        throw new errors.ValidationError(err.errors);
      }

      if (duplicateError(err)) {
        if (err.message.includes('cardKey')) {
          throw new errors.DuplicateCardError();
        }
        throw new errors.DuplicateUsernameError();
      }

      if (badRequestError(err)) {
        throw new errors.InvalidRegistrationError(err.message);
      }
      throw err;
    });
};

export const toggleActive: RequestHandler = async (req, res) => {
  const user = await User.findOne({ cardKey: req.params.cardKey });
  if (!user) {
    throw new errors.NotFoundError('user');
  }

  user.active = !user.active;
  const saved = await user.save();
  res.json(saved);
};

export const changeCard: RequestHandler = (req, res) =>
  User.authenticate(req.params.username, req.body.password)
    .then((user) => {
      user.cardKey = req.body.cardKey;
      return user.save();
    })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      if (duplicateError(err)) {
        throw new errors.DuplicateCardError();
      }
      throw err;
    });

export const deactivateAllNonAdmin: RequestHandler = async (req, res) => {
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

export default {
  count,
  list,
  create,
  generate,
  toggleActive,
  changeCard,
  deactivateAllNonAdmin,
};
