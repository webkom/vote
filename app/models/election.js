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
        ]
    });


    schema.methods.addAlternatives = function(alternatives, next){
        var that = this;
        async.each(alternatives, function(alt,cb){
            that.alternatives.push(alt);
            alt.save(cb);
        }, function(){
            that.save(next);
        });

    };


    return mongoose.model(collection, schema);
};