const mongoose = require('mongoose');
const User = require('../models/user');
const errors = require('../errors');
const errorChecks = require('../errors/error-checks');

const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { mailHandler } = require('../digital/mail');

exports.count = async (req, res) => {
  const query = { admin: false, moderator: false };
  if (req.query.active === 'true') {
    query.active = true;
  } else if (req.query.active === 'false') {
    query.active = false;
  }

  const count = await User.countDocuments(query);
  res.json({ users: count });
};

exports.list = async (req, res) => {
  const users = await User.find({}, 'username admin active moderator');
  res.json(users);
};

exports.create = (req, res) => {
  const user = new User(req.body);
  return User.register(user, req.body.password)
    .then((createdUser) => res.status(201).json(createdUser.getCleanUser()))
    .catch(mongoose.Error.ValidationError, (err) => {
      throw new errors.ValidationError(err.errors);
    })
    .catch(errorChecks.DuplicateError, (err) => {
      if (err.message.includes('cardKey')) {
        throw new errors.DuplicateCardError();
      }

      throw new errors.DuplicateUsernameError();
    })
    .catch(errorChecks.BadRequestError, (err) => {
      throw new errors.InvalidRegistrationError(err.message);
    });
};

exports.generate = (req, res) => {
  const randomPassword = crypto.randomBytes(5).toString('hex');
  const cardKey = uuidv4();
  const userObject = {
    username: req.body.email
      .split('@')[0]
      .match(/[a-zA-Z]+/g)
      .join(''),
    cardKey: cardKey,
  };
  const user = new User(userObject);
  return User.register(user, randomPassword)
    .then(async (createdUser) => {
      mailHandler(
        createdUser.username,
        req.body.email,
        randomPassword
      ).then(() => res.status(201).json(createdUser.getCleanUser()));
    })
    .catch(mongoose.Error.ValidationError, (err) => {
      throw new errors.ValidationError(err.errors);
    })
    .catch(errorChecks.DuplicateError, (err) => {
      if (err.message.includes('cardKey')) {
        throw new errors.DuplicateCardError();
      }

      throw new errors.DuplicateUsernameError();
    })
    .catch(errorChecks.BadRequestError, (err) => {
      // Comment to make git diff not be dumb
      throw new errors.InvalidRegistrationError(err.message);
    });
};

exports.toggleActive = async (req, res) => {
  const user = await User.findOne({ cardKey: req.params.cardKey });
  if (!user) {
    throw new errors.NotFoundError('user');
  }

  user.active = !user.active;
  const saved = await user.save();
  res.json(saved);
};

exports.changeCard = (req, res) =>
  User.authenticate(req.params.username, req.body.password)
    .then((user) => {
      user.cardKey = req.body.cardKey;
      return user.save();
    })
    .then((user) => {
      res.json(user);
    })
    .catch(errorChecks.DuplicateError, () => {
      throw new errors.DuplicateCardError();
    });

exports.deactivateAllNonAdmin = async (req, res) => {
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
