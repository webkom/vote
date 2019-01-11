var objectAssign = require('object-assign');
var baseConfig = require('./base.config');

module.exports = objectAssign(baseConfig, {
  mode: 'development',
  devtool: 'eval-source-map'
});
