exports = module.exports = function (collection, mongoose) {
    var schema = mongoose.Schema({
        hash: {
            type: String,
            required: true,
            index: true
        }
    });

    return mongoose.model(collection, schema);
};