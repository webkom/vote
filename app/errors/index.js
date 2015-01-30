function InactiveUserError(username) {
    this.name = 'InactiveUserError';
    this.message = 'Can\'t vote with an inactive user: ' + username;
}
InactiveUserError.prototype = Object.create(Error.prototype);
InactiveUserError.prototype.constructor = InactiveUserError;
exports.InactiveUserError = InactiveUserError;

function VoteError(message) {
    this.name = 'VoteError';
    this.message = message || 'Error during voting process.';
}
VoteError.prototype = Object.create(Error.prototype);
VoteError.prototype.constructor = VoteError;
exports.VoteError = VoteError;

exports.handleError = function(res, err, statusCode) {
    if (!statusCode) statusCode = 500;

    return res.status(statusCode).json({
        status: statusCode,
        message: err.message
    });
};
