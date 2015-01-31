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

function LoginError() {
    this.name = 'LoginError';
    this.message = 'You need to be logged in to access this resource.';
    this.statusCode = 401;
}
LoginError.prototype = Object.create(Error.prototype);
LoginError.prototype.constructor = LoginError;
exports.LoginError = LoginError;

function PermissionError() {
    this.name = 'PermissionError';
    this.message = 'You need to be an admin to access this resource.';
    this.statusCode = 403;
}
PermissionError.prototype = Object.create(Error.prototype);
PermissionError.prototype.constructor = PermissionError;
exports.PermissionError = PermissionError;

exports.handleError = function(res, err, statusCode) {
    if (!statusCode) {
        statusCode = err.statusCode ? err.statusCode : 500;
    }

    return res.status(statusCode).json({
        status: statusCode,
        message: err.message
    });
};
