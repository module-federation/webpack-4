## wpmjs
对systemjs的封装, 以pkgname的方式引资源 提供了些比较便利的API（调试模式API待补充）, 一般用于构建工具[import-http-webpack-plugin](https://https://www.npmjs.com/package/import-http-webpack-plugin)
``` js
window.wpmjs.import("@scope/name/entry?query=1&query2=2")
```

<!--|  dev | boolean  | false | 是否是开发模式 | 目前一般由插件自动开启, 用于开发模式热更新 |-->

## wpmjs.setConfig
+ ### 参数
  wpmjs.setConfig(options)
  * options

  |  参数   | 类型 | 默认值  | 作用  | 使用场景 |
  |  ----  | ----  |----  | ----  | ---- |
  |  env | string  | "" |  |  |
  |  map | object  | {react: "vue@0.1?a=1"} | 包名映射配置, 对依赖也能生效 |  |


+ ### 示例
```js
import 'wpmjs';

window.wpmjs.setConfig({
    "react": "react@17"
});

```

## wpmjs.import
+ ### 参数
``` js
  wpmjs.import(`@[scope]/[name]@[version]/[entry]?[query]`)
  // 也可以直接用域名请求, 不会经过resolvePath、resolve拦截器
  wpmjs.import(`http://xxxxxx`)
```
  例: 
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
  * `wpmjs.import`返回一个被代理的对象，这个对象可以预先用.或解构获取任意属性。
  * 如果属性存在, 返回Promise\<prop\>
  * 如果属性不存在, 返回Promise\<undefined\>


+ ### 示例
``` jsx
import 'wpmjs';
const { default: React, useState } = wpmjs.import('react@latest');
useState // Proxy<Promise>
await useState // function

React.useState // Proxy<Promise>
await React.useState // function

React.a.b.c.s.d.f.g // Proxy<Promise>
await React.a.b.c.s.d.f.g // undefined
```

## wpmjs.get
+ ### 说明
  * `wpmjs.get`获取包的同步值，但是需要确保已经加载完成。
  * 未加载完成返回`undefined`。
+ ### 示例
``` jsx
import 'wpmjs';
;(async function () {
  await wpmjs.import('react@latest');
  const { default: React, useState } = wpmjs.get('react@latest')
  useState // function
})()
```

## wpmjs.on("resolve")
包解析拦截器, 下面的例子会将请求[  import "wpmjs/$/antd?a=1"  ]改为[  import "wpmjs/$/ele?a=1"  ]
+ ### 参数
```js
wpmjs.on("resolve", ({name, version, query, entry, env}) => {
  // name: "antd"
  // version: "latest"
  // query: "?a=1"
  // entry: "/button"

  if (name === "antd") {
    return {
      name: "ele"
    }
  }
})
```
  * options

  |  参数   | 类型 | 默认值  | 作用  | 使用场景 |
  |  ----  | ----  |----  | ----  | ---- |
  |  name | string  | '' | 包名 |  |
  |  version | string  | "latest" | 版本号 |  |
  |  query | string  | '' | query string |
  |  entry | string  | '' | 入口 |
  |  env | string  | '' | 环境 |


## wpmjs.on("resolvePath")
包解析拦截器, 使用包请求信息组装出包的请求url
+ ### 参数
```js
wpmjs.on("resolvePath", ({name, version, query, entry, env}) => {
    return `https://${env}.com/${name}/${version}${query ? "?" + query : ""}`
})
```
  * options

  |  参数   | 类型 | 默认值  | 作用  | 使用场景 |
  |  ----  | ----  |----  | ----  | ---- |
  |  name | string  | '' | 包名 |  |
  |  version | string  | "latest" | 版本号 |  |
  |  query | string  | '' | query string |
  |  entry | string  | '' | 入口 |
  |  env | string  | '' | 环境 |
  
  
## wpmjs.on("resolveModule")
包请求拦截器, 下方示例为默认值, 默认使用systemjs加载包
+ ### 参数
```js
wpmjs.on("resolveModule", ({url, entry}) => {
    return window.System.import(url)
})
```
  * options

  |  参数   | 类型 | 默认值  | 作用  | 使用场景 |
  |  ----  | ----  |----  | ----  | ---- |
  |  url | string  | '' | 请求url |  |
  |  entry | string  | undefined \|\| "" | 入口 |  |