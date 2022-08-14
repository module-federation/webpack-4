## import-http-webpack-plugin
使webpack4可以用同步的方式import远程资源, 可以在webpack4中达到类似webpack5的ModuleFederation、top-level await等特性同样的效果

在线尝试:

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
        "react-dom": "https://cdn.jsdelivr.net/npm/react-dom@17/umd/react-dom.development.js"
      },
      injects: [
        // 插入wpmjs sdk（必须, 两种方式任选其一）
        // 1. 直接插入sdk代码, 因为sdk必须保证在每个chunk之前运行, 这种方式会使每个chunk变大
        // fs.readFileSync(require.resolve("wpmjs"), {
        //   encoding: "utf-8",
        // }).toString()
        // 2. 使用远程sdk, 这种方式便于统一管理sdk版本, 不会使多个chunk变大, 但是推荐将sdk存放于自己的cdn, 如果使用npm的cdn比较慢
        "https://cdn.jsdelivr.net/npm/wpmjs/dist/index.js"
      ],
    })
  ]
}
```