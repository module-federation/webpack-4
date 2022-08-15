const path = require("path")
const {CleanWebpackPlugin} = require('clean-webpack-plugin')

module.exports = {
  entry: "./src/index.js",
  resolve: {
    extensions: ['.js', '.vue', '.ts', '.json'],
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "./index.js",
    chunkFilename: "[name]-[chunkhash].js",
    libraryTarget: "umd"
  },
  module: {
    rules: []
  },
  plugins: [
    new CleanWebpackPlugin(),
  ]
};
