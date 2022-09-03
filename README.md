## import-http-webpack-plugin
使webpack4可以用同步的方式import远程资源, 优化开发体验、构建速度、发布效率。

特性:
1. 支持同一个包单例和多例的用法, 同一个包同时使用多个不同版本。
2. 支持引入其他人构建出的 "amd"、"umd"、"system" 等模块规范的包。
3. （正在开发）与module federation互相引用（https://www.npmjs.com/package/mfalize）
<!-- 3. （待支持）"import-http" 引入 "module federation exposes"。
4. （待支持）"module federation remotes" 引入 "import-http"。
5. （待支持）"import-http" 使用 "module federation shares"。
6. （待支持）"module federation shares" 使用 "import-http deps"。 -->

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
        // remotes的key, 无论配置 "react@17" 还是 "react" 都会使项目中所有的 "react" 使用远程依赖
        // 例: 如果有多个项目需要使用不同版本的react, 则需要使用 "react@version" 这种方式
        "react@17": "https://assets.weimob.com/react@17/umd/react.development.js",
        "react-dom": "https://assets.weimob.com/react-dom/umd/react-dom.development.js",
        "react-refresh/runtime": "https://assets.weimob.com/react-refresh-umd@0",
        "react-refresh": "https://assets.weimob.com/react-refresh-umd@0",

        // 2. 使用统一包管理平台
        "test": "test",
      },
      /**
       * dev模式时的远程包, 比如开发时热更新需要react.development版本
       */
      devRemotes: {
        "react@17": "https://assets.weimob.com/react@17/umd/react.development.js",
        "react-dom": "https://assets.weimob.com/react-dom@17/umd/react-dom.development.js",
      },
      defineRemotes: {
        // 如果使用的远程包不是自己构建的, 且包有依赖, 则需要在此处配置依赖映射
        "react-dom": {
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

## 如果对一个包需要产生多例, 也就是同时出现不同版本, 则需要看下方例子, 如果需要单例, 则无需关注

remotes单例和多例配置, 是通过key处的标识确定的, 如下方3个webpack.config.js, 按引入顺序为【A】、【B】、【C】：

* 【A】和【B】项目的 "react" 都会使用第一次注册的 "react@17" 所对应的 "https://assets.weimob.com/react@17/umd/react.development.js" 这个版本, 两个项目中的 "react" 引用是单例
* 【B】项目独立使用或先于【A】项目引入的话, "react@17" 会使用 "https://assets.weimob.com/react/umd/react.development.js" 这个版本
* 【A】和【C】项目的 "react" 会使用 "xx.com/react@17/umd/xx.js"、"xx.com/react@18/umd/xx.js" 这两个版本, 两个项目中的 "react" 引用是多例
``` js
// webpack.config.A.js
remotes: {
    "react@17": "https://assets.weimob.com/react@17/umd/react.development.js"
}

// webpack.config.B.js
remotes: {
    "react@17": "https://assets.weimob.com/react/umd/react.development.js"
}

// webpack.config.C.js
remotes: {
    "react": "http://https://assets.weimob.com/react@18/umd/react.development.js"
}
```