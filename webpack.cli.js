import path from 'path';
import { fileURLToPath } from 'url';
import nodeExternals from 'webpack-node-externals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'none',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].cjs',
  },
  target: 'node',
  resolve: {
    extensions: ['.ts'],
  },
  entry: {
    users: './bin/users.ts',
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
};
