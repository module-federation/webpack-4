## import-http-webpack-plugin
使webpack4可以用同步的方式import远程资源, 优化开发体验、构建速度、发布效率


在线尝试（包含开发热更新）:

https://stackblitz.com/github/wpmjs/wpmjs/tree/main/examples/hot-refresh?file=app2%2Fsrc%2FApp2.jsx

使用方式:
``` js
// ！！！！重要！！！！请不要将assets.weimob.com用于生产环境, 此域名随时会设置可用域名白名单
// ！！！！重要！！！！翻墙访问 https://cdn.jsdelivr.net/npm/react
import React from "https://assets.weimob.com/react@17/umd/react.development.js"
import json from "https://assets.weimob.com/vue@2.7.8/package.json"
const vue = import("https://assets.weimob.com/vue@2.7.8/dist/vue.js")

;(async function () {
  console.log('json:', json)
  console.log('react:', React)
  console.log('vue:', await vue)
})()
```


配置方式：
``` js
// webpack.config.js
module.exports = {
  plugins: [
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
    })
  ]
}
```