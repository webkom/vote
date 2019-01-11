var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  mode: "none",
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
    rules: [{
        test: /\.styl$/,
        use: [
            {
                loader: "style-loader"
            },
            {
                loader: "css-loader"
            },
            {
                loader: "stylus-loader",
                options: {
                    use: [require('nib')()]
                }
            }
        ]
    }]
  },
  plugins: [new ExtractTextPlugin('main.css')]
};
