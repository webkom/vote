var User = require('../models/user');
var errors = require('../errors');

exports.list = function(req, res) {
    return User.findAsync({}, 'username admin active')
        .then(function(users) {
            return res.json(users);
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};

exports.create = function(req, res) {
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
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};
