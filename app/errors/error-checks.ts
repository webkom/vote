export const duplicateError = (err) => err.code === 11000 || err.code === 11001;
export const badRequestError = (err) => err.name === 'BadRequestError';
