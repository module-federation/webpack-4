const HtmlWebpackPlugin = require("html-webpack-plugin");
const fs = require("fs")
const ReactRefreshPlugin = require("@pmmmwh/react-refresh-webpack-plugin")
const path = require("path")
const MF = require("mf-webpack4")

module.exports = {
  entry: "./src/index.js",
  context: __dirname,
  resolve: {
    extensions: [".js", ".json", ".jsx", ".css"],
  },
  output: {
    filename: '[name].js',
    chunkFilename: "[name].js",
    path: `${__dirname}/dist`,
    publicPath: "http://localhost:9001/",
  },
  devServer: {
    hot: true,
    open: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    allowedHosts: 'all',
    historyApiFallback: true,
    port: 9001,
  },
  plugins: [
    new ReactRefreshPlugin({
      overlay: false
    }),
    new MF({
      remotes: {
        "app2": "app2@http://localhost:9002/remoteEntry.js",
        "app3": "app3@http://localhost:9003/remoteEntry.js",
        "promiseRemote": `promise {
          init() {},
          get() {
            return function () {
              return {
                promiseRemote: "aaaa"
              }
            }
          }
        }`,
      },
      name: "app1",
      filename: "remoteEntry.js",
      shared: ["react", "react-dom"],
      exposes: {
        "./App": "./src/App1"
      }
    }),
    new HtmlWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.m?jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              configFile: path.resolve(process.cwd(), "babel.config.js"),
              babelrc: false
            }
          }
        ]
      },
    ]
  }
};