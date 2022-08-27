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
        // 插入wpmjs sdk（必须, 两种方式任选其一）
        // 1. 直接插入sdk代码, sdk会插入在每个chunk之前
        // fs.readFileSync(require.resolve("wpmjs"), {
        //   encoding: "utf-8",
        // }).toString()
        // 2. 使用远程sdk, 便于统一管理sdk版本, 推荐将sdk存放于自己的cdn
        "https://assets.weimob.com/wpmjs@2",
      ],
    })
  ]
}
```