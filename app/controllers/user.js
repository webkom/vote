var User = require('../models/user');
var errors = require('../errors');

exports.list = function(req, res) {
    return User.findAsync({ admin: false }, 'username admin active')
        .then(function(users) {
            return res.json(users);
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};

exports.register = function(req, res) {
    var user = new User(req.body);
    User.registerAsync(user, req.body.password)
        .then(function(createdUser) {
            return res.status(201).json(createdUser.getCleanUser());
        })
        .catch(function(err) {
            return errors.handleError(res, err);
        });
};
