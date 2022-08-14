## import-http-webpack-plugin
使webpack4可以用同步的方式import远程资源

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
        // fs.readFileSync(require.resolve("wpmjs"), {
        //   encoding: "utf-8",
        // }).toString()
        "https://cdn.jsdelivr.net/npm/wpmjs/dist/index.js"
      ],
    })
  ]
}
```