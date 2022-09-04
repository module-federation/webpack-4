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
    publicPath: "http://localhost:9002/",
    jsonpFunction: "app2_jsonp",
    libraryTarget: "umd"
  },
  devServer: {
    hot: true,
    open: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    allowedHosts: 'all',
    historyApiFallback: true,
    port: 9002,
  },
  plugins: [
    new ReactRefreshPlugin({
      overlay: false
    }),
    new ImportHttpPlugin({
      init: {
        resolvePath(request) {
          return "https://unpkg.com/" + request.name + (request.version ? "@" + request.version : "")
        },
        resolveEntryFile() {
          return "/dist/index.js"
        }
      },
      remotes: {
        // 1. 编译时使用远程的包
        "react@17": "https://unpkg.com/react@17/umd/react.development.js",
        "react-dom@17": "https://unpkg.com/react-dom@17/umd/react-dom.development.js",
        "react-refresh/runtime": "https://unpkg.com/react-refresh-umd@0",
        "react-refresh": "https://unpkg.com/react-refresh-umd@0",
        "vue@2": "https://unpkg.com/vue@2.6.14/dist/vue.js",

        // 2. 编译时使用统一包管理平台
        "test@3": "test",
      },
      devRemotes: {
        "react@17": "https://unpkg.com/react@17/umd/react.development.js",
        "react-dom@17": "https://unpkg.com/react-dom@17/umd/react-dom.development.js",
      },
      defineRemotes: {
        // 如果使用的远程包不是自己构建的, 且包有依赖, 则需要在此处配置依赖映射
        "react-dom@17": {
          "deps": [
            "react-refresh/runtime",
            { name: "react", target: "react@17" }
          ]
        }
      },
      injects: [
        "https://unpkg.com/wpmjs@2/dist/index.js",
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