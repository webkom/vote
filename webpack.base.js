/* eslint-disable */
var ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
  output: {
    path:'public/',
    filename: 'bundle.js',
    publicPath: ''
  },
  resolve: {
    extensions: ['', '.js','.styl']
  },
  entry: [
    './client/app.js',
  ],
  module: {
    loaders: [
      { test: /\.styl$/, loader: ExtractTextPlugin.extract("style","css!stylus") }
    ]
  },
  stylus: {
    use: [require('nib')()]
  },
  plugins: [
        new ExtractTextPlugin("main.css")
    ]
};
