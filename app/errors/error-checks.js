exports.DuplicateError = function(err) {
    return err.code === 11000 || err.code === 11001;
};
