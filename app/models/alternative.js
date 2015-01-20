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

    schema.methods.addVote = function (hash,cb){
        new mongoose.model('vote')({
            hash: hash,
            alternative: this
        }).save(function (err, vote){
            if(err) return cb(err);
            return cb(null, vote);
        });
    };

    return mongoose.model(collection, schema);
};