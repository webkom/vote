const mongoose = require('mongoose');
const User = require('../models/user');
const errors = require('../errors');
const errorChecks = require('../errors/error-checks');

exports.count = (req, res) => {
  const query = { admin: false };
  if (req.query.active === 'true') {
    query.active = true;
  } else if (req.query.active === 'false') {
    query.active = false;
  }

  return User.count(query).then(count =>
    res.json({
      users: count
    })
  );
};

exports.list = (req, res) =>
  User.find({}, 'username admin active').then(users => res.json(users));

exports.create = (req, res) => {
  const user = new User(req.body);
  return User.register(user, req.body.password)
    .then(createdUser => res.status(201).json(createdUser.getCleanUser()))
    .catch(mongoose.Error.ValidationError, err => {
      throw new errors.ValidationError(err.errors);
    })
    .catch(errorChecks.DuplicateError, err => {
      if (err.message.includes('cardKey')) {
        throw new errors.DuplicateCardError();
      }

      throw new errors.DuplicateUsernameError();
    })
    .catch(errorChecks.BadRequestError, err => {
      throw new errors.InvalidRegistrationError(err.message);
    });
};

exports.toggleActive = (req, res) =>
  User.findOne({ cardKey: req.params.cardKey })
    .then(user => {
      if (!user) {
        throw new errors.NotFoundError('user');
      }
      user.active = !user.active;
      return user.save();
    })
    .then(user => res.json(user));

exports.changeCard = (req, res) =>
  User.authenticate(req.params.username, req.body.password)
    .then(user => {
      user.cardKey = req.body.cardKey;
      return user.save();
    })
    .then(user => {
      res.json(user);
    })
    .catch(errorChecks.DuplicateError, () => {
      throw new errors.DuplicateCardError();
    });

exports.deactivateAllNonAdmin = (req, res) =>
  User.update({ admin: false }, { active: false }, { multi: true }).then(() =>
    res.status(200).json({
      message: 'Users deactivated.',
      status: 200
    })
  );
