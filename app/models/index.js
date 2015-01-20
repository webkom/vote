exports = module.exports = function (mongoose) {
    return {
        User: require('./user')('user', mongoose),
        Election: require('./election')('election', mongoose),
        Alternative: require('./alternative')('alternative', mongoose),
        Vote: require('./vote')('vote', mongoose)
    };
};