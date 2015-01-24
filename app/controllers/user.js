var async = require('async');
var User = require('../models/user');

exports.retrieve = function (req, res) {
    User.find({ admin: false }, function(err, users) {
        if (err) return res.send(err);
        return res.json(users);
    });
};

exports.create = function (req, res) {
    var i = 0;
    var users = [];

    async.whilst(function(){
        return i < req.body.amount;
    }, function(cb) {
        User.create({}, function(err, user) {
            if (err) return cb(err);
            i++;
            users.push(user);
            cb();
        });
    }, function() {
        return res.status(201).json(users);
    });
};
