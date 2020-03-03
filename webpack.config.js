var webpack = require('webpack');

module.exports = {
  mode: 'none',
  output: {
    path: `${__dirname}/public`,
    filename: '[name].js',
    publicPath: '/static/'
  },
  resolve: {
    extensions: ['.js', '.styl']
  },
  entry: {
    bundle: './client/app.js',
    login: './client/login.js'
  },
  module: {
    rules: [
      {
        test: /\.styl$/,
        loader: 'file-loader?name=[name].css!stylus-loader'
      },
      {
        test: /\.mp3$/,
        loader: 'file-loader?name=[name].mp3'
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
