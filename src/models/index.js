exports = module.exports = (mongoose) => {
    return {
        User: require('./user')('user', mongoose)
    };
};