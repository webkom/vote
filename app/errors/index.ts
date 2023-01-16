import { Response } from 'express';
import { IAlternative, IElection } from '../types/types';
import mongoose from 'mongoose';

export class HTTPError extends Error {
  status: number;
  code?: number | string;
  name: string;
  message: string;
  payload?: Record<string, unknown>;

  constructor() {
    super();
  }
}

class InactiveUserError extends HTTPError {
  constructor(username: string) {
    super();
    this.message = `Can't vote with an inactive user: ${username}`;
    this.status = 403;
    this.name = 'InactiveUserError';
  }
}

class AlreadyVotedError extends HTTPError {
  constructor() {
    super();
    this.name = 'AlreadyVotedError';
    this.message = 'You can only vote once per election.';
    this.status = 400;
  }
}

class InactiveElectionError extends HTTPError {
  constructor() {
    super();
    this.name = 'InactiveElectionError';
    this.message = "Can't vote on an inactive election.";
    this.status = 400;
  }
}

class LoginError extends HTTPError {
  constructor() {
    super();
    this.name = 'LoginError';
    this.message = 'You need to be logged in to access this resource.';
    this.status = 401;
  }
}

class PermissionError extends HTTPError {
  constructor() {
    super();
    this.name = 'PermissionError';
    this.message = 'You need to be an admin to access this resource.';
    this.status = 403;
  }
}

class InvalidPayloadError extends HTTPError {
  constructor(property: string) {
    super();
    this.name = 'InvalidPayloadError';
    this.message = `Missing property ${property} from payload.`;
    this.status = 400;
  }
}

class AccessCodeError extends HTTPError {
  constructor() {
    super();
    this.name = 'AccessCodeError';
    this.message = 'Incorrect accesscode supplied';
    this.status = 403;
  }
}

class InvalidPriorityError extends HTTPError {
  constructor(alternative: string, election: string) {
    super();
    this.name = 'InvalidPriorityError';
    this.message = `One or more alternatives does not exist on election.`;
    this.status = 400;
  }
}

class InvalidSTVPrioritiesLengthError extends HTTPError {
  constructor(priorities: IAlternative[], election: IElection) {
    super();
    this.name = 'InvalidSTVPrioritiesLengthError';
    this.message = `Priorities is of length ${priorities.length}, election has ${election.alternatives.length} alternatives.`;
    this.status = 400;
  }
}

class InvalidNormalPrioritiesLengthError extends HTTPError {
  constructor(priorities: IAlternative[]) {
    super();
    this.name = 'InvalidNormalPrioritiesLengthError';
    this.message = `Priorities is of length ${priorities.length} on a normal election.`;
    this.status = 400;
  }
}

class MissingHeaderError extends HTTPError {
  constructor(header: string) {
    super();
    this.name = 'MissingHeaderError';
    this.message = `Missing header ${header}.`;
    this.status = 400;
  }
}

class NotFoundError extends HTTPError {
  constructor(type: string) {
    super();
    this.name = 'NotFoundError';
    this.message = `Couldn't find ${type}.`;
    this.status = 404;
  }
}

class ActiveElectionError extends HTTPError {
  constructor(message: string) {
    super();
    this.name = 'ActiveElectionError';
    this.message = message || 'You need to deactivate the election first.';
    this.status = 400;
  }
}

class ValidationError extends HTTPError {
  errors:
    | {
        [path: string]:
          | mongoose.Error.ValidatorError
          | mongoose.Error.CastError
          | mongoose.Error.ValidationError;
      }
    | string;
  constructor(
    errors?:
      | {
          [path: string]:
            | mongoose.Error.ValidatorError
            | mongoose.Error.CastError
            | mongoose.Error.ValidationError;
        }
      | string
  ) {
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

class InvalidRegistrationError extends HTTPError {
  constructor(message: string) {
    super();
    this.name = 'InvalidRegistrationError';
    this.message = message;
    this.status = 400;
  }
}

class AdminVotingError extends HTTPError {
  constructor() {
    super();
    this.name = 'AdminVotingError';
    this.message = "Admin users can't vote.";
    this.status = 403;
  }
}

class ModeratorVotingError extends HTTPError {
  constructor() {
    super();
    this.name = 'ModeratorVotingError';
    this.message = "Moderator users can't vote.";
    this.status = 403;
  }
}

class DuplicateCardError extends HTTPError {
  constructor() {
    super();
    this.name = 'DuplicateCardError';
    this.message = "There's already a user registered to this card.";
    this.status = 400;
  }
}

class DuplicateUsernameError extends HTTPError {
  constructor() {
    super();
    this.name = 'DuplicateUsernameError';
    this.message = "There's already a user with this username.";
    this.status = 400;
  }
}

class DuplicateIdentifierError extends HTTPError {
  constructor() {
    super();
    this.name = 'DuplicateIdentifierError';
    this.message = 'This identifier has allready gotten a user.';
    this.status = 409;
  }
}

class AlreadyActiveElectionError extends HTTPError {
  constructor() {
    super();
    this.name = 'AlreadyActiveElection';
    this.message = 'There is already an active election';
    this.status = 409;
  }
}

class MailError extends HTTPError {
  constructor(err: Error) {
    super();
    this.name = 'MailError';
    this.message = `Something went wrong with the email. Err: ${err}`;
    this.status = 500;
  }
}

class NoAssociatedUserError extends HTTPError {
  constructor() {
    super();
    this.name = 'NoAssociatedUserError';
    this.message = "Can't delete a register with no associated user";
    this.status = 400;
  }
}

class InvalidElectionTypeError extends HTTPError {
  constructor() {
    super();
    this.name = 'InvalidElectionTypeError';
    this.message = "Can't use or create an elction of this type";
    this.status = 400;
  }
}

export default {
  InactiveUserError,
  AlreadyVotedError,
  InactiveElectionError,
  LoginError,
  PermissionError,
  InvalidPayloadError,
  AccessCodeError,
  InvalidPriorityError,
  InvalidSTVPrioritiesLengthError,
  InvalidNormalPrioritiesLengthError,
  InvalidElectionTypeError,
  MissingHeaderError,
  NotFoundError,
  ActiveElectionError,
  ValidationError,
  InvalidRegistrationError,
  AdminVotingError,
  ModeratorVotingError,
  DuplicateCardError,
  DuplicateUsernameError,
  DuplicateIdentifierError,
  AlreadyActiveElectionError,
  MailError,
  NoAssociatedUserError,
};

export const handleError = (
  res: Response,
  err: HTTPError,
  status?: number
): Response => {
  const statusCode = status || err.status || 500;
  if (statusCode >= 500) {
    console.error(err);
  }
  return res.status(statusCode).json(
    err.payload || {
      name: err.name,
      status: statusCode,
      message: err.message,
    }
  );
};
