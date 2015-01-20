var async = require('async');
module.exports = function (router,models) {

    router.route('/user/create')
        .post(function (req, res){
            var i = 0;
            var users = [];
            async.whilst(function(){
                return i<req.body.amount;

            }, function(cb){
                new models.User().save(function(err, usr){
                    if(err) cb();
                    else{
                        i++;
                        users.push(usr);
                        cb();
                    }
                })
            }, function(){
                return res.status(201).send(users);
            });
        });

    router.route('/user')
        .get(function (req, res){
            models.User.find({admin:false}, function(err, users){
                if (err) return res.send(err);
                return res.json(users);
            })
        });


};

