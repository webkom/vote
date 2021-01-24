const mongoose = require('mongoose');
const User = require('../models/user');
const Register = require('../models/register');
const errors = require('../errors');
const errorChecks = require('../errors/error-checks');

const crypto = require('crypto');
const { mailHandler } = require('../digital/mail');
const short = require('short-uuid');

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

exports.generate = async (req, res) => {
  const { legoUser, email, ignoreExistingUser } = req.body;

  if (!legoUser || !email) {
    throw new errors.InvalidPayloadError('Params legoUser or email provided.');
  }

  // Try to fetch an entry from the register with this username
  const entry = await Register.findOne({ legoUser }).exec();
  
  if (entry && ignoreExistingUser) {
    return res.status(409).json(legoUser);
  }

  // Entry has no user this user is allready activated
  if (entry && !entry.user) {
    return mailHandler('reject', { email })
      .then(() => {
        throw new errors.DuplicateLegoUserError();
      })
      .catch((err) => res.status(500).json(err));
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
        .then(() => res.status(201).json(legoUser))
        .catch((err) => res.status(500).json(err))
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
  console.log(userObject, user);
  return User.register(user, password)
    .then((createdUser) =>
      mailHandler('send', { email, username: createdUser.username, password })
        .then(() => new Register({ legoUser, email, user }).save())
        .then(() => res.status(201).json(legoUser))
        .catch((err) => res.status(500).json(err))
    )
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
