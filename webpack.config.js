const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: 'none',
  output: {
    path: path.resolve(__dirname, '../', 'public'),
    filename: '[name].js',
    publicPath: '/static/',
  },
  resolve: {
    extensions: ['.js', '.styl'],
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    },
  },
  entry: {
    bundle: './client/app.js',
    login: './client/login.js',
  },
  module: {
    rules: [
      {
        test: /\.styl$/,
        use: [
          { loader: 'file-loader', options: { name: '[name].css' } },
          { loader: 'stylus-loader' },
        ],
      },
      {
        test: /\.mp3$/,
        use: [{ loader: 'file-loader', options: { name: '[name].mp3' } }],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        stylus: {
          use: [require('nib')()],
          import: ['~nib/lib/nib/index.styl'],
        },
      },
    }),
  ],
};
