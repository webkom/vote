var crypto = require('crypto');

exports.createHash = function(username, electionId) {
    var appSecret = process.env.APP_SECRET || 'dev_secret';
    var hash = crypto.createHash('sha512');
    hash.setEncoding('hex');
    hash.write(username);
    hash.write(String(electionId));
    hash.write(appSecret);
    hash.end();

    var createdHash = hash.read();
    return createdHash;
};
