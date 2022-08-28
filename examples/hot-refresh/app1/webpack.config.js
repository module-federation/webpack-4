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
    new ReactRefreshPlugin({
      overlay: false
    }),
    new ImportHttpPlugin({
      init: {
        resolvePath(request) {
          return "https://assets.weimob.com/" + request.name + (request.version ? "@" + request.version : "")
        },
        resolveEntryFile(request) {
          return "/dist/index.js"
        }
      },
      /**
       * 配置本次构建使用的远程依赖
       * remotes配置有2种类型
       */
      remotes: {
        // 1. 使用远程的包 
        "react@17": "https://assets.weimob.com/react@17/umd/react.development.js",
        "react-dom@17": "https://assets.weimob.com/react-dom@17/umd/react-dom.development.js",
        "react-refresh/runtime": "https://assets.weimob.com/react-refresh-umd@0",
        "react-refresh": "https://assets.weimob.com/react-refresh-umd@0",

        // 2. 使用统一包管理平台
        "test@3": "test",
      },
      /**
       * dev模式时的远程包, 比如开发时热更新需要react.development版本
       */
      devRemotes: {
        "react@17": "https://assets.weimob.com/react@17/umd/react.development.js",
        "react-dom@17": "https://assets.weimob.com/react-dom@17/umd/react-dom.development.js",
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
        "https://assets.weimob.com/wpmjs@2/dist/index.js",
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