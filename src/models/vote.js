exports = module.exports = (collection, mongoose) => {
    var schema = mongoose.Schema({
        hash: {
            type: String,
            required: true,
            index: true
        },
        alternative: {
            type: mongoose.Schema.Types.ObjectId, ref: 'alternative',
            required: true,
            index: true
        }
    });

    return mongoose.model(collection, schema);
};