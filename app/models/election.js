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

    schema.methods.addAlternative = function(alternative){
        if(this.alternatives) this.alternatives.push(alternative)
        else this.alternatives = [alternative];
    };

    return mongoose.model(collection, schema);
};