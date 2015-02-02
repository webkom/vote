function InactiveUserError(username) {
    this.name = 'InactiveUserError';
    this.message = 'Can\'t vote with an inactive user: ' + username;
    this.statusCode = 403;
}
InactiveUserError.prototype = Object.create(Error.prototype);
InactiveUserError.prototype.constructor = InactiveUserError;
exports.InactiveUserError = InactiveUserError;

function VoteError(message) {
    this.name = 'VoteError';
    this.message = message || 'Error during voting process.';
    this.statusCode = 400;
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

function InvalidPayloadError(property) {
    this.name = 'InvalidPayloadError';
    this.message = 'Missing property ' + property + ' from payload.';
    this.statusCode = 400;
}
InvalidPayloadError.prototype = Object.create(Error.prototype);
InvalidPayloadError.prototype.constructor = InvalidPayloadError;
exports.InvalidPayloadError = InvalidPayloadError;

function MissingHeaderError(header) {
    this.name = 'MissingHeaderError';
    this.message = 'Missing header ' + header + '.';
    this.statusCode = 400;
}
MissingHeaderError.prototype = Object.create(Error.prototype);
MissingHeaderError.prototype.constructor = MissingHeaderError;
exports.MissingHeaderError = MissingHeaderError;

function NotFoundError(type) {
    this.name = 'NotFoundError';
    this.message = 'Couldn\'t find ' + type + '.';
    this.statusCode = 404;
}
NotFoundError.prototype = Object.create(Error.prototype);
NotFoundError.prototype.constructor = NotFoundError;
exports.NotFoundError = NotFoundError;

function DeleteError(message) {
    this.name = 'DeleteError';
    this.message = message || 'Cannot delete resource.';
    this.statusCode = 400;
}
DeleteError.prototype = Object.create(Error.prototype);
DeleteError.prototype.constructor = DeleteError;
exports.DeleteError = DeleteError;

function ValidationError(errors) {
    this.name = 'ValidationError';
    this.message = 'Validation failed.';
    this.statusCode = 400;
    this.errors = errors;
    this.payload = {
        name: this.name,
        message: this.message,
        status: this.statusCode,
        errors: this.errors
    };
}
ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;
exports.ValidationError = ValidationError;

function InvalidRegistrationError(message) {
    this.name = 'InvalidRegistrationError';
    this.message = message;
    this.statusCode = 400;
}
InvalidRegistrationError.prototype = Object.create(Error.prototype);
InvalidRegistrationError.prototype.constructor = InvalidRegistrationError;
exports.InvalidRegistrationError = InvalidRegistrationError;

exports.handleError = function(res, err, statusCode) {
    if (!statusCode) {
        statusCode = err.statusCode ? err.statusCode : 500;
    }

    return res
        .status(statusCode)
        .json(err.payload || {
            name: err.name,
            status: statusCode,
            message: err.message
        });
};
