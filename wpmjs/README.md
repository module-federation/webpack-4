## wpmjs

[中文文档](https://github.com/wpmjs/wpmjs/tree/main/wpmjs/doc/chinese)

"Wpm (web package manager)" integrates the packages of "umd, system, module federation" and other specifications, and can even reference a "share" to achieve the connection between "umd deps" and "mf share", and provides hooks that can uniformly manage url specifications

## characteristic
* fusion dependency（umd、system、mf）
* Out of the build environment（wpmjs sdk）
* Support webpack4 + webpack5

## milepost（Sequential implementation）
* [mf-webpack4](https://www.npmjs.com/package/mf-webpack4)  <input type="checkbox" checked />
* [import-http-webpack-plugin](https://www.npmjs.com/package/import-http-webpack-plugin) This plug-in will be integrated into "mf-webpack4", please do not use it alone <input type="checkbox" />
* module-federation webpack5 Support umd <input type="checkbox" />
* Convenient development mode+hot update <input type="checkbox" />

## 

``` js
window.wpmjs.import("@scope/name/entry?query=1&query2=2")
window.wpmjs.import("http://a.com")
window.wpmjs.import("mfshare:scope:version:react")
```

### Usage example:
``` js
window.wpmjs.setConfig({
  dev: false,
  env: "online",
  // URL specification of unified package management platform
  resolvePath: function(request) {
      return "https://exam.com/" + request.name + "@" + request.version
  },
  resolveEntryFile(request) {
      return "/index.js"
  },
  idUrlMap: {
    // Use HTTP address
    // Here“ react@17 "The version number" react "may not be provided. If there are multiple versions at the same time, the" Id "with the version number can be used to distinguish
    "react@17": "https://unpkg.com/react@17/umd/react.development.js",
    "react-dom": "https://unpkg.com/react-dom@17/umd/react-dom.development.js",
    "react-refresh/runtime": "https://unpkg.com/react-refresh-umd@0",

    // Use unified package management platform
    "test": "test",

    // module federation need idDefineMap
    "mfpkg": "http://localhost:3000/remoteEntry.js"
  },
  /**
    * Remote package in dev mode, such as react.development version for hot update during development
    */
  devIdUrlMap: {
    "react@17": "https://unpkg.com/react@17/umd/react.development.js",
    "react-dom": "https://unpkg.com/react-dom@17/umd/react-dom.development.js",
  },
  idDefineMap: {
    // If the remote package used is not self built and the package has dependencies, you need to configure dependency mapping here
    // example react-dom: define(["react"], function)
    "react-dom": {
      "deps": [
        // Add additional dependencies "react-refresh/runtime"
        "react-refresh/runtime",
        // Use“ react@17 "React" as "react DOM" dependency“
        { name: "react", target: "react@17" }
      ]
    },
    "mfpkg": {
      remoteType: "mf",
      name: "app1"
    }
  },
})

window.wpmjs.import("react-dom")
window.wpmjs.import("react@17")
```

<!--|  dev | boolean  | false | 是否是开发模式 | 目前一般由插件自动开启, 用于开发模式热更新 |-->

## setConfig
+ ### params
  setConfig(options)
  * options

  |  param   | type | default  | desc  |
  |  ----  | ----  |----  | ----  |
  |  env | string  | "" | Distinguish environment |
  |  dev | boolean  |  | Whether it is dev mode, which is generally used to develop hot updates |
  |  idUrlMap | object  | {} | Package configuration, global validation |
  |  idDefineMap | object  | {} | Package configuration, global validation |
  |  devIdUrlMap | object  | {} | Package configuration, global validation |
  | resolvePath | function | | Unified management pack URL |
  | resolveEntryFile | function | | Unified management pack URL |
  | resolveQuery | function | | Unified management pack URL |


+ ### Examples
```js
import 'wpmjs';
window.wpmjs.setConfig({
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
+ ### params
import(str)
  * window.wpmjs.import("react")
  * window.wpmjs.import("antd@latest/button?a=2")
  * window.wpmjs.import("http://a.com")
  * window.wpmjs.import("mfshare:scope:version:react")

| param          | required  | type     | default   | desc               |
|----------------|------|---------|---------|------------------|
| scope    | false    | string  | -     |  |
| name    | true    | string  | -     |                |
| version      | false    | string | - |  |
| entry      | false    | string | - |  |
| query      | false    | string | - |  |

+ ### returnValue
  Proxy\<Promise\>
  * `import`Returns a proxy object. This object can be used to obtain any properties in advance by. Or deconstruction.
  * If the attribute exists, returnPromise\<prop\>
  * If the property does not exist, return Promise\<undefined\>


+ ### Examples
``` jsx
import 'wpmjs';
const { default: React, useState } = window.wpmjs.import('react@latest');
useState // Proxy<Promise>
await useState // function

React.useState // Proxy<Promise>
await React.useState // function

React.a.b.c.s.d.f.g // Proxy<Promise>
await React.a.b.c.s.d.f.g // undefined
```

## get
+ ### desc
  * `get` Get the synchronization value of the package, but ensure that it has been loaded.
  * Not loaded. Return after completion`undefined`。
+ ### Examples
``` jsx
import 'wpmjs';
;(async function () {
  await window.wpmjs.import('react@latest');
  const { default: React, useState } = window.wpmjs.get('react@latest')
  useState // function
})()
```
