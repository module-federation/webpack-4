const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const { ModuleFederationPlugin } = require('webpack').container;
const r = require("@pmmmwh/react-refresh-webpack-plugin")

module.exports = {
  entry: "./src/index",
  mode: "development",
  devServer: {
    open: true,
    static: path.join(__dirname, "dist"),
    port: 9001,
  },
  output: {
    publicPath: "auto",
    // libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: ["@babel/preset-react"],
        },
      },
    ],
  },
  plugins: [
    new r(),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new ModuleFederationPlugin({
      name: 'app5',
      filename: 'remoteEntry.js',
      remotes: {
        "app2": "app2@http://localhost:9002/remoteEntry.js",
        "app1": `app1@http://localhost:9800/remoteEntry.js`
      },
      // remoteType: "umd",
      // library: {
      //   type: "umd"
      // },
      // exposes: {
      //   './App': './src/App',
      // },
      shared: { 'react-refresh': {}, react: { requiredVersion: "14", singleton: false }, 'react-dom': { singleton: true } },
    }),
  ],
};

