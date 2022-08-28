## wpmjs
对systemjs的封装, 以pkgname的方式引资源 提供了些比较便利的API, 一般用于构建工具[import-http-webpack-plugin](https://www.npmjs.com/package/import-http-webpack-plugin)
``` js
window.System.__wpmjs__.import("@scope/name/entry?query=1&query2=2")
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
