exports = module.exports = (mongoose) => {
    return {
        User: require('./user')('user', mongoose),
        Election: require('./election')('election', mongoose),
        Alternative: require('./alternative')('alternative', mongoose),
        Vote: require('./alternative')('vote', mongoose)
    };
};