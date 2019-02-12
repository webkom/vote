var webpack = require('webpack');

module.exports = {
  mode: 'none',
  output: {
    path: `${__dirname}/../public`,
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  resolve: {
    extensions: ['.js', '.styl']
  },
  entry: ['./client/app.js'],
  module: {
    rules: [
      {
        test: /\.styl$/,
        loader: 'file-loader?name=[name].css!stylus-loader'
      }
    ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        stylus: {
          use: [require('nib')()],
          import: ['~nib/lib/nib/index.styl']
        }
      }
    })
  ]
};
