const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const ExternalTemplateRemotesPlugin = require("external-remotes-plugin");
const path = require('path');

module.exports = {
  entry: './src/index',
  mode: 'development',
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    static: path.join(__dirname, 'dist'),
    port: 9002,
  },
  output: {
    publicPath: 'http://localhost:9002/',
    // library: {
    //   type: "umd"
    // }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-react'],
        },
      },
    ],
  },
  plugins: [
    // To learn more about the usage of this plugin, please visit https://webpack.js.org/plugins/module-federation-plugin/
    new ExternalTemplateRemotesPlugin(),
    new ModuleFederationPlugin({
      name: 'app2',
      filename: 'remoteEntry.js',
      library: {
        name: "app2",
        type: "global"
      },
      exposes: {
        './App': './src/App',
      },
      remotes: {
        klein: `promise new Promise(async re => {
          const klein = await window.System.import("https://wpm.hsmob.com/wpmv2/react/latest/online/index.js")
          re({
            init () {},
            get() {
              return function () {
                return klein
              }
            }
          })
        })`,
        // app3: "app3@[app3Url]/remoteEntry.js"
      },
      shareScope: "default",
      shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
