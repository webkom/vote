var async = require('async');
exports = module.exports = function (collection, mongoose){
    var schema = mongoose.Schema({
        title: {
            type: String,
            required: true,
            index: true
        },
        description: {
            type: String
        },
        alternatives: [
            {
                type: mongoose.Schema.Types.ObjectId, ref: 'alternative'
            }
        ],
        votes: [
            {
                type: mongoose.Schema.Types.ObjectId, ref: 'vote'
            }
        ]
    });


    schema.methods.addAlternatives = function(alternatives, next){
        var that = this;
        if (alternatives.constructor != Array) alternatives = [alternatives];
        async.each(alternatives, function(alt,cb){
            that.alternatives.push(alt);
            alt.election = that._id;
            alt.save(cb);
        }, function(){
            that.save(next);
        });

    };


    return mongoose.model(collection, schema);
};