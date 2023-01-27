import webpack from 'webpack';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import CopyPlugin from 'copy-webpack-plugin';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'none',
  output: {
    path: path.resolve(__dirname, 'dist', 'public'),
    filename: '[name].js',
    publicPath: '/static/',
  },
  resolve: {
    extensions: ['.cjs', '.js', '.styl'],
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
        test: /\.[mc]?js/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.styl$/,
        use: [
          { loader: 'file-loader', options: { name: '[name].css' } },
          //{ loader: 'css-loader' },
          { loader: 'stylus-loader' },
        ],
      },
      {
        test: /\.mp3$/,
        use: [{ loader: 'file-loader', options: { name: '[name].mp3' } }],
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
    new CopyPlugin({
      patterns: [
        { from: 'public', to: path.resolve(__dirname, 'dist', 'public') },
        { from: 'app/digital/template.html', to: './template.html' },
      ],
    }),
  ],
};
