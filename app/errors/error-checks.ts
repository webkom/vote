import type { HTTPError } from './index';

export const duplicateError = (err: HTTPError): boolean =>
  err.code === 11000 || err.code === 11001;
export const badRequestError = (err: HTTPError): boolean =>
  err.name === 'BadRequestError';
