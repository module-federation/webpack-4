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
    jsonpFunction: "app1_jsonp"
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
      alias: {
        react: "https://cdn.jsdelivr.net/npm/react@17/umd/react.development.js",
        "react-dom": "https://cdn.jsdelivr.net/npm/react-dom@17/umd/react-dom.development.js"
      },
      injects: [
        // fs.readFileSync(require.resolve("wpmjs"), {
        //   encoding: "utf-8",
        // }).toString()
        "https://cdn.jsdelivr.net/npm/wpmjs/dist/index.js"
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