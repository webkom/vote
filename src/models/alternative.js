exports = module.exports = (collection, mongoose) => {
    var schema = mongoose.Schema({
        description: {
            type: String,
            required: true
        }
    });

    return mongoose.model(collection, schema);
};