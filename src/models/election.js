exports = module.exports = (collection, mongoose) => {
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

    return mongoose.model(collection, schema);
};