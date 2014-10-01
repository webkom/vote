// throw error
function _throw (m) {
    throw m;
}

var convict = require('convict');
var validator = require('validator');


// catch all errors with no handler
process.on('uncaughtException',(err)=> {
    debug(`Caught exception without specific handler: ${util.inspect(err)}`);
    debug(err.stack, 'error');
    process.exit(1);
});
