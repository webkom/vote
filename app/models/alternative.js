var bcrypt = require('bcryptjs');
var async = require('async');
exports = module.exports = function (collection, mongoose) {
    var schema = mongoose.Schema({
        description: {
            type: String,
            required: true
        },
        votes:[
            {
                type: mongoose.Schema.Types.ObjectId, ref: 'vote'
            }
        ],
        election:{
            type: mongoose.Schema.Types.ObjectId, ref: 'election',
            required: true
        }
    });

    schema.methods.getVotes = function(cb){
        mongoose.model('vote').find({alternative:this}, function (err, votes){
            if(err) return cb(err,null);
            return cb(null,votes);
        });

    };

    schema.methods.addVote = function(username, next){
        var that = this;
        var notVoted = true;
        mongoose.model('user').findOne({username:username}, function(err, user){
            if(!user.active) return next({'message': 'User not active'});

            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(username, salt, function (err, hash) {

                    mongoose.model('election').findById(that.election)
                        .populate('votes')
                        .exec(function(err, election){
                            async.each(election.votes, function(vote, cb){
                                bcrypt.compare(username,vote.hash, function(err, res){
                                    notVoted = !res;
                                    cb();
                                });
                            }, function(){
                                if (notVoted){
                                    var Vote = mongoose.model('vote');
                                    var vote = new Vote({hash:hash});
                                    that.votes.push(vote);
                                    election.votes.push(vote);
                                    election.save(function(err, election){
                                        vote.save(function(err, vote){
                                            if (err) return err;
                                            that.save(next);
                                        });
                                    });
                                }
                                else {
                                    next({'message': 'Already voted'});
                                }
                            });

                        });

                });
            });


        });



    };

    return mongoose.model(collection, schema);
};