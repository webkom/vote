var objectAssign = require('object-assign');
var baseConfig = require('./base.config');

module.exports = objectAssign(baseConfig, {
    devtool: 'source-map'
});
