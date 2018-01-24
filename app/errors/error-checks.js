exports.DuplicateError = err => err.code === 11000 || err.code === 11001;

exports.BadRequestError = err => err.name === 'BadRequestError';
