const path = require('path');

const src = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'dist');

module.exports = {
  mode: 'production',
  entry: {
    content: path.join(src, 'content')
  },

  output: {
    path: dist,
    filename: '[name].js'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
    ]
  },

  resolve: {
    extensions: [ '.js' ]
  },

  optimization: {
    // no minimize for webextension
    minimize: false,
    chunkIds: 'named',
  },
};
