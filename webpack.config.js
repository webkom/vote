/* eslint-disable */
var objectAssign = require('object-assign');
var webpack = require('webpack');
var baseConfig = require('./webpack.base');

module.exports = objectAssign(baseConfig, {
  devtool: 'source-map'
});
