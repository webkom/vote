var crypto = require('crypto');

exports.createHash = function(username) {
    var appSecret = process.env.APP_SECRET || 'dev_secret';
    var hash = crypto.createHash('sha512');
    hash.setEncoding('hex');
    hash.write(username);
    hash.write(appSecret);
    hash.end();

    var createdHash = hash.read();
    return createdHash;
};
