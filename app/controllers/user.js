const mongoose = require('mongoose');
const User = require('../models/user');
const errors = require('../errors');
const errorChecks = require('../errors/error-checks');

exports.count = (req, res, next) => {
  const query = { admin: false };
  if (req.query.active === 'true') {
    query.active = true;
  } else if (req.query.active === 'false') {
    query.active = false;
  }

  return User.count(query)
    .then(count =>
      res.json({
        users: count
      })
    )
    .catch(next);
};

exports.list = (req, res, next) =>
  User.find({}, 'username admin active')
    .then(users => res.json(users))
    .catch(next);

exports.create = (req, res, next) => {
  const user = new User(req.body);
  User.register(user, req.body.password)
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
    })
    .catch(next);
};

exports.toggleActive = (req, res, next) => {
  User.findOne({ cardKey: req.params.cardKey })
    .then(user => {
      if (!user) {
        throw new errors.NotFoundError('user');
      }
      user.active = !user.active;
      return user.save();
    })
    .then(user => res.json(user))
    .catch(next);
};

exports.changeCard = (req, res, next) => {
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
    })
    .catch(next);
};

exports.deactivateAllNonAdmin = (req, res, next) => {
  User.update({ admin: false }, { active: false }, { multi: true })
    .then(() =>
      res.status(200).json({
        message: 'Users deactivated.',
        status: 200
      })
    )
    .catch(next);
};
