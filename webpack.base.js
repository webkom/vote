/* eslint-disable */
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
      { test: /\.styl$/, loader: 'style!css!stylus' }
    ]
  },
  stylus: {
    use: [require('nib')()]
  },
};
