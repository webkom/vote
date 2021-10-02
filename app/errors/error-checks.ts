export const DuplicateError = (err) => err.code === 11000 || err.code === 11001;
export const BadRequestError = (err) => err.name === 'BadRequestError';
