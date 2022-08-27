const HtmlWebpackPlugin = require("html-webpack-plugin");
const ImportHttpPlugin = require("import-http-webpack-plugin")
const fs = require("fs")
const ReactRefreshPlugin = require("@pmmmwh/react-refresh-webpack-plugin")
const path = require("path")

module.exports = {
  entry: "./src/index.js",
  context: __dirname,
  output: {
    filename: 'index.js',
    chunkFilename: "[name].js",
    path: `${__dirname}/dist`,
    publicPath: "http://localhost:9001/",
    jsonpFunction: "app1_jsonp",
    libraryTarget: "umd"
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
    new ReactRefreshPlugin(),
    new ImportHttpPlugin({
      init: {
        resolvePath(request) {
          return "https://exam.com/" + request.name + "/" + request.version.replace("@", "") + "/index.js" + (request.query ? "?" + request.query : request.query)
        }
      },
      remotes: {
        react: "https://assets.weimob.com/react@17/umd/react.development.js",
        "react-dom": {
          "url": "https://assets.weimob.com/react-dom@17/umd/react-dom.development.js",
          "deps": ["react-refresh/runtime", "vue"]
        },
        "react-refresh/runtime": {
          "url": "https://assets.weimob.com/react-refresh-umd@0",
          deps: []
        },
        "vue": "https://assets.weimob.com/vue@2.6.14/dist/vue.js",
      },
      injects: [
        "https://assets.weimob.com/wpmjs@2",
      ],
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