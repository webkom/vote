const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'none',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/public/',
  },
  target: 'node',
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['.js', '.styl', '.ts'],
  },
  entry: {
    server: './index.ts',
    users: './bin/users.ts',
  },
  module: {
    rules: [
      {
        test: /\.ya?ml$/,
        use: 'yaml-loader',
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: [nodeExternals()],
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'app/views', to: 'app/views' },
        { from: 'public', to: 'public' },
      ],
    }),
  ],
};
