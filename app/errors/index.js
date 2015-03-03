var util = require('util');

function InactiveUserError(username) {
    this.name = 'InactiveUserError';
    this.message = 'Can\'t vote with an inactive user: ' + username;
    this.status = 403;
}
util.inherits(InactiveUserError, Error);
exports.InactiveUserError = InactiveUserError;

function AlreadyVotedError() {
    this.name = 'AlreadyVotedError';
    this.message = 'You can only vote once per election.';
    this.status = 400;
}
util.inherits(AlreadyVotedError, Error);
exports.AlreadyVotedError = AlreadyVotedError;

function InactiveElectionError() {
    this.name = 'InactiveElectionError';
    this.message = 'Can\'t vote on an inactive election.';
    this.status = 400;
}
util.inherits(InactiveElectionError, Error);
exports.InactiveElectionError = InactiveElectionError;

function LoginError() {
    this.name = 'LoginError';
    this.message = 'You need to be logged in to access this resource.';
    this.status = 401;
}
util.inherits(LoginError, Error);
exports.LoginError = LoginError;

function PermissionError() {
    this.name = 'PermissionError';
    this.message = 'You need to be an admin to access this resource.';
    this.status = 403;
}
util.inherits(PermissionError, Error);
exports.PermissionError = PermissionError;

function InvalidPayloadError(property) {
    this.name = 'InvalidPayloadError';
    this.message = 'Missing property ' + property + ' from payload.';
    this.status = 400;
}
util.inherits(InvalidPayloadError, Error);
exports.InvalidPayloadError = InvalidPayloadError;

function MissingHeaderError(header) {
    this.name = 'MissingHeaderError';
    this.message = 'Missing header ' + header + '.';
    this.status = 400;
}
util.inherits(MissingHeaderError, Error);
exports.MissingHeaderError = MissingHeaderError;

function NotFoundError(type) {
    this.name = 'NotFoundError';
    this.message = 'Couldn\'t find ' + type + '.';
    this.status = 404;
}
util.inherits(NotFoundError, Error);
exports.NotFoundError = NotFoundError;

function ActiveElectionError(message) {
    this.name = 'ActiveElectionError';
    this.message = message || 'You need to deactivate the election first.';
    this.status = 400;
}
util.inherits(ActiveElectionError, Error);
exports.ActiveElectionError = ActiveElectionError;

function ValidationError(errors) {
    this.name = 'ValidationError';
    this.message = 'Validation failed.';
    this.status = 400;
    this.errors = errors;
    this.payload = {
        name: this.name,
        message: this.message,
        status: this.status,
        errors: this.errors
    };
}
util.inherits(ValidationError, Error);
exports.ValidationError = ValidationError;

function InvalidRegistrationError(message) {
    this.name = 'InvalidRegistrationError';
    this.message = message;
    this.status = 400;
}
util.inherits(InvalidRegistrationError, Error);
exports.InvalidRegistrationError = InvalidRegistrationError;

function AdminVotingError() {
    this.name = 'AdminVotingError';
    this.message = 'Admin users can\'t vote.';
    this.status = 403;
}
util.inherits(AdminVotingError, Error);
exports.AdminVotingError = AdminVotingError;

function DuplicateCardError() {
    this.name = 'DuplicateCardError';
    this.message = 'There\'s already a user registered to this card.';
    this.status = 400;
}
util.inherits(DuplicateCardError, Error);
exports.DuplicateCardError = DuplicateCardError;

exports.handleError = function(res, err, status) {
    if (!status) {
        status = err.status || 500;
    }

    return res
        .status(status)
        .json(err.payload || {
            name: err.name,
            status: status,
            message: err.message
        });
};
