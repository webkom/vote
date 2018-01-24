var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  output: {
    path: `${__dirname}/../public`,
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  resolve: {
    extensions: ['', '.js', '.styl']
  },
  entry: ['./client/app.js'],
  module: {
    loaders: [
      {
        test: /\.styl$/,
        loader: ExtractTextPlugin.extract('style', 'css?minimize!stylus')
      }
    ]
  },
  stylus: {
    use: [require('nib')()]
  },
  plugins: [new ExtractTextPlugin('main.css')]
};
