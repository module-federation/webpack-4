## wpmjs
对systemjs的封装, 以pkgname的方式引资源 提供了些比较便利的API, 一般用于构建工具[import-http-webpack-plugin](https://www.npmjs.com/package/import-http-webpack-plugin)
``` js
window.System.__wpmjs__.import("@scope/name/entry?query=1&query2=2")
```

### 使用示例：
``` js
window.System.__wpmjs__.setConfig({
  dev: false,
  env: "online",
  // 统一包管理平台的url规范
  resolvePath: function(request) {
      return "https://exam.com/" + request.name + "@" + request.version
  },
  resolveEntryFile(request) {
      return "/index.js"
  },
  idUrlMap: {
    // 使用http地址
    // 此处"react@17"也可不配版本号"react", 如果需要同时存在多版本, 可以把"id"带上版本号用来区分
    "react@17": "https://unpkg.com/react@17/umd/react.development.js",
    "react-dom": "https://unpkg.com/react-dom@17/umd/react-dom.development.js",
    "react-refresh/runtime": "https://unpkg.com/react-refresh-umd@0",

    // 使用统一包管理平台
    "test": "test",
  },
  /**
    * dev模式时的远程包, 比如开发时热更新需要react.development版本
    */
  devIdUrlMap: {
    "react@17": "https://unpkg.com/react@17/umd/react.development.js",
    "react-dom": "https://unpkg.com/react-dom@17/umd/react-dom.development.js",
  },
  idDefineMap: {
    // 如果使用的远程包不是自己构建的, 且包有依赖, 则需要在此处配置依赖映射
    // 例react-dom: define(["react"], function)
    "react-dom": {
      "deps": [
        // 添加额外依赖"react-refresh/runtime"
        "react-refresh/runtime",
        // 使用 "react@17" 作为 "react-dom" 依赖的 "react"
        { name: "react", target: "react@17" }
      ]
    }
  },
})

window.System.__wpmjs__.import("react-dom")
window.System.__wpmjs__.import("react@17")
```

<!--|  dev | boolean  | false | 是否是开发模式 | 目前一般由插件自动开启, 用于开发模式热更新 |-->

## setConfig
+ ### 参数
  setConfig(options)
  * options

  |  参数   | 类型 | 默认值  | 作用  |
  |  ----  | ----  |----  | ----  |
  |  env | string  | "" | 区分环境 |
  |  dev | boolean  |  | 是否是dev模式, 一般用于开发热更新 |
  |  idUrlMap | object  | {} | 包配置, 全局生效 |
  |  idDefineMap | object  | {} | 包配置, 全局生效 |
  |  devIdUrlMap | object  | {} | 包配置, 全局生效 |
  | resolvePath | function | | 统一管理包url |
  | resolveEntryFile | function | | 统一管理包url |
  | resolveQuery | function | | 统一管理包url |


+ ### 示例
```js
import 'wpmjs';
window.System.__wpmjs__.setConfig({
    dev: false,
    env: "online",
    idUrlMap: {},
    idDefineMap: {},
    devIdUrlMap: {},
    resolvePath: function(request) {
        return "https://exam.com/" + request.name + "@" + request.version
    },
    resolveEntryFile(request) {
        return "/index.js"
    }
})

```

## import
+ ### 参数
import(str)
  * import "react"
  * import "antd@latest/button?a=2"

| 配置项          | 必填  | 类型     | 默认值   | 作用               |
|----------------|------|---------|---------|------------------|
| scope    | 否    | string  | 无     | 空间名               |
| name    | 是    | string  | 无     | 包名               |
| version      | 否    | string | 无 | 版本号 |
| entry      | 否    | string | 无 | 多入口包, 指定入口 |
| query      | 否    | string | 无 | query |

+ ### 返回值
  Proxy\<Promise\>
  * `import`返回一个被代理的对象，这个对象可以预先用.或解构获取任意属性。
  * 如果属性存在, 返回Promise\<prop\>
  * 如果属性不存在, 返回Promise\<undefined\>


+ ### 示例
``` jsx
import 'wpmjs';
const { default: React, useState } = window.System.__wpmjs__.import('react@latest');
useState // Proxy<Promise>
await useState // function

React.useState // Proxy<Promise>
await React.useState // function

React.a.b.c.s.d.f.g // Proxy<Promise>
await React.a.b.c.s.d.f.g // undefined
```

## get
+ ### 说明
  * `get`获取包的同步值，但是需要确保已经加载完成。
  * 未加载完成返回`undefined`。
+ ### 示例
``` jsx
import 'wpmjs';
;(async function () {
  await window.System.__wpmjs__.import('react@latest');
  const { default: React, useState } = window.System.__wpmjs__.get('react@latest')
  useState // function
})()
```
