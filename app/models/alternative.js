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
        ]
    });

    schema.methods.getVotes = function(cb){
        mongoose.model('vote').find({alternative:this}, function (err, votes){
            if(err) return cb(err,null);
            return cb(null,votes);
        });

    };

    schema.methods.addVotes = function(votes, next){
        var that = this;
        async.each(votes, function(vote,cb){
            that.votes.push(vote);
            vote.save(cb);
        }, next);

    };

    return mongoose.model(collection, schema);
};