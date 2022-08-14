const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const FF = require("import-wpm-webpack-plugin")
const FF1 = require("system-context-webpack-plugin")
const fs = require("fs")
const ReactRefreshPlugin = require("@pmmmwh/react-refresh-webpack-plugin")
const path = require("path")
otherPlugins = [
  // new ReactRefreshPlugin({})
]
otherPlugins.push(new FF({
  init: {
    env: "qa",
    map: {
      "@core-klein/basic-multiple": `@core-klein/basic-multiple?cssScope=.a`,
      "@wemo-ui/klein": `@wemo-ui/klein?cssScope=.a`,
      "@core-klein/container": `@core-klein/container?cssScope=.a`,
    },
    resolvePath(a) {
      return "http://wpm.hsmob.com/wpmv2/" + a.name + "/" + a.version + "/" + a.env + "/index.js" + (a.query ? "?" + a.query : "")
    },
  },
  alias: {
    react: "https://cdn.jsdelivr.net/npm/react@17/umd/react.development.js",
    "react-dom": "https://cdn.jsdelivr.net/npm/react-dom@17/umd/react-dom.development.js",
    vue: "wpmjs/$/vue",
    "vuereact-combined": "wpmjs/$/vuereact-combined",
    "@wemo-ui/klein": "wpmjs/$/@wemo-ui/klein",
    "@wemo-ui/klein-vue": "wpmjs/$/@wemo-ui/klein-vue",
    "@core-klein/container": "wpmjs/$/@core-klein/container",
    "@core-klein/basic-multiple": "wpmjs/$/@core-klein/basic-multiple",
  },
  injects: [
    fs.readFileSync("./wpmjs.js", {
      encoding: "utf-8",
    }).toString(),
    `
    window.wpmjs.on("resolveModule", function (request) {
      var url = request.url
      var entry = request.entry
      return window.System.import(url).then(res => {
        if (entry) {
          if (res && res[entry]) {
            try {
              return res[entry]()
            } catch (e) {
              console.error(\`entry函数错误：【\${url}】【\${entry}】\`)
              throw e
            }
          }
          throw new Error(\`找不到入口模块:\${entry}\`)
        }
        return res
      })
    })
    `,
  ],
})
)
// otherPlugins.push(new MiniCssExtractPlugin())

module.exports = {
  entry: {
    NodeMsg: ["./src/index.js"]
  },
  // entry: "./src/index.js",
  context: __dirname,
  output: {
    filename: '[name].js',
    chunkFilename: "[name].js",
    path: `${__dirname}/dist`,
    // libraryTarget: 'system',
    publicPath: "http://localhost:9001/",
    // library: 'someLibName',
    // libraryTarget: 'amd',
    // filename: 'someLibName.js',
    // auxiliaryComment: 'Test Comment',
  },
  // target: "web",
  // mode: "production",
  //...
  devServer: {
    hot: true,
    open: true,
    // hot: true,
    // // allowedHosts: 'all',
    // historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    client: {
      webSocketURL: 'ws://localhost:9001/ws',
    },
    // // static: {
    // //   // directory: path.join(__dirname, 'public'),
    // // },
    // compress: true,
    port: 9001,
  },
  plugins: [
    ...otherPlugins,
    new HtmlWebpackPlugin({
    })
  ],
  module: {
    rules: [
        // { parser: { system: false } },
      {
        test: /.css$/,
        use: ["css-loader"]
      },
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