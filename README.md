## import-http-webpack-plugin
使webpack4可以用同步的方式import远程资源, 优化开发体验、构建速度、发布效率


在线尝试（包含开发热更新）:

https://stackblitz.com/github/wpmjs/wpmjs/tree/main/examples/hot-refresh?file=app2%2Fsrc%2FApp2.jsx

使用方式:
``` js
import React from "https://cdn.jsdelivr.net/npm/react@17/umd/react.development.js"
import json from "https://cdn.jsdelivr.net/npm/vue@2.7.8/package.json"
const vue = import("https://cdn.jsdelivr.net/npm/vue@2.7.8/dist/vue.js")

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
      alias: {
        react: "https://cdn.jsdelivr.net/npm/react@17/umd/react.development.js",
        "react-dom": "https://cdn.jsdelivr.net/npm/react-dom@17/umd/react-dom.development.js",
        "react-refresh/runtime": "https://cdn.jsdelivr.net/npm/react-refresh-umd@0/dist/index.js", // dev模式配合@pmmmwh/react-refresh-webpack-plugin热更新
      },
      injects: [

      ],
    }),
    new ImportHttpPlugin({
      alias: {
        // wpmjs/$/[pkgname] 此种格式表示这个包走远程, 不参与本地构建
        react: "wpmjs/$/react",
        "react-dom": "wpmjs/$/react-dom",
        "react-refresh/runtime": "wpmjs/$/react-refresh/runtime",
      },
      init: {
        map: {
          react: "https://unpkg.zhimg.com/react@17/umd/react.development.js",
          "react-dom": {
            "url": "https://unpkg.zhimg.com/react-dom@17/umd/react-dom.development.js",
            // "react-dom"默认只有一个依赖 "react", "react"组件热更新需要"react-refresh/runtime"先于"react-dom"执行, 所以为"react-dom"添加额外依赖保证顺序
            "deps": ["react-refresh/runtime"]
          },
          "react-refresh/runtime": "https://unpkg.zhimg.com/react-refresh-umd@0/dist/index.js",
          "vue": "https://unpkg.zhimg.com/vue@2.6.14/dist/vue.js",
        },
      },
      injects: [
        // 插入wpmjs sdk（必须, 两种方式任选其一）
        // 1. 直接插入sdk代码, sdk会插入在每个chunk之前
        // fs.readFileSync(require.resolve("wpmjs"), {
        //   encoding: "utf-8",
        // }).toString()
        // 2. 使用远程sdk, 便于统一管理sdk版本, 推荐将sdk存放于自己的cdn, jsdelivr需要翻墙
        "https://cdn.jsdelivr.net/npm/wpmjs@2/dist/index.js"
      ],
    })
  ]
}
```