var util = require('util');

function InactiveUserError(username) {
    this.name = 'InactiveUserError';
    this.message = 'Can\'t vote with an inactive user: ' + username;
    this.statusCode = 403;
}
util.inherits(InactiveUserError, Error);
exports.InactiveUserError = InactiveUserError;

function AlreadyVotedError() {
    this.name = 'AlreadyVotedError';
    this.message = 'You can only vote once per election.';
    this.statusCode = 400;
}
util.inherits(AlreadyVotedError, Error);
exports.AlreadyVotedError = AlreadyVotedError;

function InactiveElectionError() {
    this.name = 'InactiveElectionError';
    this.message = 'Can\'t vote on an inactive election.';
    this.statusCode = 400;
}
util.inherits(InactiveElectionError, Error);
exports.InactiveElectionError = InactiveElectionError;

function LoginError() {
    this.name = 'LoginError';
    this.message = 'You need to be logged in to access this resource.';
    this.statusCode = 401;
}
util.inherits(LoginError, Error);
exports.LoginError = LoginError;

function PermissionError() {
    this.name = 'PermissionError';
    this.message = 'You need to be an admin to access this resource.';
    this.statusCode = 403;
}
util.inherits(PermissionError, Error);
exports.PermissionError = PermissionError;

function InvalidPayloadError(property) {
    this.name = 'InvalidPayloadError';
    this.message = 'Missing property ' + property + ' from payload.';
    this.statusCode = 400;
}
util.inherits(InvalidPayloadError, Error);
exports.InvalidPayloadError = InvalidPayloadError;

function MissingHeaderError(header) {
    this.name = 'MissingHeaderError';
    this.message = 'Missing header ' + header + '.';
    this.statusCode = 400;
}
util.inherits(MissingHeaderError, Error);
exports.MissingHeaderError = MissingHeaderError;

function NotFoundError(type) {
    this.name = 'NotFoundError';
    this.message = 'Couldn\'t find ' + type + '.';
    this.statusCode = 404;
}
util.inherits(NotFoundError, Error);
exports.NotFoundError = NotFoundError;

function ActiveElectionError(message) {
    this.name = 'ActiveElectionError';
    this.message = message || 'You need to deactivate the election first.';
    this.statusCode = 400;
}
util.inherits(ActiveElectionError, Error);
exports.ActiveElectionError = ActiveElectionError;

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
util.inherits(ValidationError, Error);
exports.ValidationError = ValidationError;

function InvalidRegistrationError(message) {
    this.name = 'InvalidRegistrationError';
    this.message = message;
    this.statusCode = 400;
}
util.inherits(InvalidRegistrationError, Error);
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
