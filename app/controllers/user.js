var Bluebird = require('bluebird');
var User = require('../models/user');
var errors = require('../errors');
var errorChecks = require('../errors/error-checks');

exports.count = function(req, res, next) {
    var query = { admin:false };
    if (req.query.active === 'true') {
        query.active = true;
    } else if (req.query.active === 'false') {
        query.active = false;
    }

    return User.countAsync(query)
        .then(function(count) {
            return res.json({
                users: count
            });
        })
        .catch(next);
};

exports.list = function(req, res, next) {
    return User.findAsync({}, 'username admin active')
        .then(function(users) {
            return res.json(users);
        })
        .catch(next);
};

exports.create = function(req, res, next) {
    var user = new User(req.body);
    User.registerAsync(user, req.body.password)
        .then(function(createdUser) {
            return res.status(201).json(createdUser.getCleanUser());
        })
        .catch(function(err) {
            if (err.name === 'BadRequestError') {
                throw new errors.InvalidRegistrationError(err.message);
            }
            throw err;
        })
        .catch(next);
};

exports.toggleActive = function(req, res, next) {
    User.findOneAsync({cardKey: req.params.cardKey})
        .then(function(user) {
            if (!user) {
                throw new errors.NotFoundError('user');
            }
            user.active = !user.active;
            return user.saveAsync();
        })
        .spread(function(user) {
            return res.json(user);
        })
        .catch(next);
};

exports.changeCard= function(req, res, next) {
    var authenticateAsync = Bluebird.promisify(User.authenticate());
    authenticateAsync(req.params.username, req.body.password)
        .then(function(user) {
            // User.authenticate returns a [false, { message: 'errmessage' }] when
            // bad credentials are given
            if (Array.isArray(user)) {
                throw new errors.InvalidRegistrationError('Incorrect username and/or password.');
            }

            user.cardKey = req.body.cardKey;
            return user.saveAsync();
        })
        .spread(function(user) {
            res.json(user);
        })
        .catch(errorChecks.DuplicateError, function() {
            throw new errors.DuplicateCardError();
        })
        .catch(function(err) {
            next(err);
        });
};
