var User = require('../models/user');

exports.list = function(req, res) {
    return User.findAsync({ admin: false }, 'username admin active')
        .then(function(users) {
            return res.json(users);
        })
        .catch(function(err) {
            res.status(500).send(err);
        });
};

exports.register = function(req, res) {
    var user = new User(req.body);
    User.registerAsync(user, req.body.password)
        .then(function(createdUser) {
            return res.status(201).json(createdUser.getCleanUser());
        })
        .catch(function(err) {
            return res.status(500).json(err);
        });
};
