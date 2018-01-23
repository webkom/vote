var objectAssign = require('object-assign');
var webpack = require('webpack');
var baseConfig = require('./base.config');

module.exports = objectAssign(baseConfig, {
  plugins: baseConfig.plugins.concat([
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    }),
    new webpack.DefinePlugin({
      __DEV__: false
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ])
});
