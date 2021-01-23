class InactiveUserError extends Error {
  constructor(username) {
    super();
    this.name = 'InactiveUserError';
    this.message = `Can't vote with an inactive user: ${username}`;
    this.status = 403;
  }
}

exports.InactiveUserError = InactiveUserError;

class AlreadyVotedError extends Error {
  constructor() {
    super();
    this.name = 'AlreadyVotedError';
    this.message = 'You can only vote once per election.';
    this.status = 400;
  }
}

exports.AlreadyVotedError = AlreadyVotedError;

class InactiveElectionError extends Error {
  constructor() {
    super();
    this.name = 'InactiveElectionError';
    this.message = "Can't vote on an inactive election.";
    this.status = 400;
  }
}

exports.InactiveElectionError = InactiveElectionError;

class LoginError extends Error {
  constructor() {
    super();
    this.name = 'LoginError';
    this.message = 'You need to be logged in to access this resource.';
    this.status = 401;
  }
}

exports.LoginError = LoginError;

class PermissionError extends Error {
  constructor() {
    super();
    this.name = 'PermissionError';
    this.message = 'You need to be an admin to access this resource.';
    this.status = 403;
  }
}

exports.PermissionError = PermissionError;

class InvalidPayloadError extends Error {
  constructor(property) {
    super();
    this.name = 'InvalidPayloadError';
    this.message = `Missing property ${property} from payload.`;
    this.status = 400;
  }
}

exports.InvalidPayloadError = InvalidPayloadError;

class AccessCodeError extends Error {
  constructor() {
    super();
    this.name = 'AccessCodeError';
    this.message = 'Incorrect accesscode supplied';
    this.status = 403;
  }
}

exports.AccessCodeError = AccessCodeError;

class InvalidPriorityError extends Error {
  constructor() {
    super();
    this.name = 'InvalidPriorityError';
    this.message = `One or more alternatives does not exist on election.`;
    this.status = 400;
  }
}

exports.InvalidPriorityError = InvalidPriorityError;

class InvalidPrioritiesLengthError extends Error {
  constructor(priorities, election) {
    super();
    this.name = 'InvalidPrioritiesLengthError';
    this.message = `Priorities is of length ${priorities.length}, election has ${election.alternatives.length} alternatives.`;
    this.status = 400;
  }
}

exports.InvalidPrioritiesLengthError = InvalidPrioritiesLengthError;

class MissingHeaderError extends Error {
  constructor(header) {
    super();
    this.name = 'MissingHeaderError';
    this.message = `Missing header ${header}.`;
    this.status = 400;
  }
}

exports.MissingHeaderError = MissingHeaderError;

class NotFoundError extends Error {
  constructor(type) {
    super();
    this.name = 'NotFoundError';
    this.message = `Couldn't find ${type}.`;
    this.status = 404;
  }
}

exports.NotFoundError = NotFoundError;

class ActiveElectionError extends Error {
  constructor(message) {
    super();
    this.name = 'ActiveElectionError';
    this.message = message || 'You need to deactivate the election first.';
    this.status = 400;
  }
}

exports.ActiveElectionError = ActiveElectionError;

class ValidationError extends Error {
  constructor(errors) {
    super();
    this.name = 'ValidationError';
    this.message = 'Validation failed.';
    this.status = 400;
    this.errors = errors;
    this.payload = {
      name: this.name,
      message: this.message,
      status: this.status,
      errors: this.errors,
    };
  }
}

exports.ValidationError = ValidationError;

class InvalidRegistrationError extends Error {
  constructor(message) {
    super();
    this.name = 'InvalidRegistrationError';
    this.message = message;
    this.status = 400;
  }
}

exports.InvalidRegistrationError = InvalidRegistrationError;

class AdminVotingError extends Error {
  constructor() {
    super();
    this.name = 'AdminVotingError';
    this.message = "Admin users can't vote.";
    this.status = 403;
  }
}

exports.AdminVotingError = AdminVotingError;

class ModeratorVotingError extends Error {
  constructor() {
    super();
    this.name = 'ModeratorVotingError';
    this.message = "Moderator users can't vote.";
    this.status = 403;
  }
}

exports.ModeratorVotingError = ModeratorVotingError;

class DuplicateCardError extends Error {
  constructor() {
    super();
    this.name = 'DuplicateCardError';
    this.message = "There's already a user registered to this card.";
    this.status = 400;
  }
}

exports.DuplicateCardError = DuplicateCardError;

class DuplicateUsernameError extends Error {
  constructor() {
    super();
    this.name = 'DuplicateUsernameError';
    this.message = "There's already a user with this username.";
    this.status = 400;
  }
}

exports.DuplicateUsernameError = DuplicateUsernameError;

class DuplicateLegoUserError extends Error {
  constructor() {
    super();
    this.name = 'DuplicateLegoUserError';
    this.message = 'This LEGO user has allready gotten a user.';
    this.status = 400;
  }
}

exports.DuplicateLegoUserError = DuplicateLegoUserError;

exports.handleError = (res, err, status) => {
  const statusCode = status || err.status || 500;
  return res.status(statusCode).json(
    err.payload || {
      name: err.name,
      status: statusCode,
      message: err.message,
    }
  );
};
