var Bluebird = require('bluebird');
var User = require('../models/user');

exports.retrieve = function(req, res) {
    return User.findAsync({ admin: false })
        .then(function(users) {
            return res.json(users);
        })
        .catch(function(err) {
            res.status(500).send(err);
        });
};

exports.create = function(req, res) {
    var promises = [];

    for (var i = 0; i < req.body.amount; i++) {
        promises.push(User.createAsync({}));
    }

    return Bluebird.all(promises)
        .then(function(users) {
            return res.status(201).json(users);
        })
        .catch(function(err) {
            res.status(500).json(err);
        });
};
