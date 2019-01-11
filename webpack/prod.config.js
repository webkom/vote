var objectAssign = require('object-assign');
var webpack = require('webpack');
var baseConfig = require('./base.config');

module.exports = objectAssign(baseConfig, {
  mode: "production",
    optimization: {
        minimize: true,
    },
  plugins: baseConfig.plugins.concat([
    new webpack.DefinePlugin({
      __DEV__: false
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ])
});
