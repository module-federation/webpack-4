## import-http-webpack-plugin
This enables webpack4 to import remote resources in a synchronous manner, optimizing the development experience, construction speed and publishing efficiency.

[中文文档](doc/chinese)

### characteristic:

1. Support the use of single instance and multiple instances of the same package. The same package can use multiple different versions at the same time.

2. Support the introduction of packages with "amd", "UMD", "system" and other module specifications built by others.

3. (under development) cross reference with module Federation https://www.npmjs.com/package/usemf

<!-- 3. (to be supported) "import HTTP" introduces "module Federation exports".

4. (to be supported) "module Federation remotes" introduces "import HTTP".

5. (to be supported) "import HTTP" uses "module Federation shares".

6. (to be supported) "module Federation shares" use "import http DEPs." -->

Online attempt (including development hot update):
https://stackblitz.com/github/wpmjs/wpmjs/tree/main/examples/hot-refresh?file=app2%2Fsrc%2FApp2.jsx

### Usage:
``` js
import React from "https://unpkg.com/react@17/umd/react.development.js"
import json from "https://unpkg.com/vue@2.7.8/package.json"
const vue = import("https://unpkg.com/vue@2.7.8/dist/vue.js")

;(async function () {
  console.log('json:', json)
  console.log('react:', React)
  console.log('vue:', await vue)
})()
```


### Configuration:
``` js
// webpack.config.js
module.exports = {
  plugins: [
    new ImportHttpPlugin({
      init: {
        resolvePath(request) {
          return "https://unpkg.com/" + request.name + (request.version ? "@" + request.version : "")
        },
        resolveEntryFile(request) {
          return "/dist/index.js"
        }
      },
      /**
       * Configure remote dependencies used in this build
       * There are two types of remote configurations:
       */
      remotes: {
        // 1. Use remote packages
        // Remote key, regardless of configuration“ react@17 "Or" react "will make all" react "in the project use remote dependencies
        // Example: if multiple projects need to use different versions of react, you need to use“ react@version "This way
        "react@17": "https://unpkg.com/react@17/umd/react.development.js",
        "react-dom": "https://unpkg.com/react-dom/umd/react-dom.development.js",
        "react-refresh/runtime": "https://unpkg.com/react-refresh-umd@0",
        "react-refresh": "https://unpkg.com/react-refresh-umd@0",

        //2. Use the unified package management platform
        "test": "test",
      },
      /**
       * Remote package in dev mode, such as react.development version for hot update during development
       */
      devRemotes: {
        "react@17": "https://unpkg.com/react@17/umd/react.development.js",
        "react-dom": "https://unpkg.com/react-dom@17/umd/react-dom.development.js",
      },
      defineRemotes: {
        // If the remote package used is not self built and the package has dependencies, you need to configure dependency mapping here
        "react-dom": {
          "deps": [
            "react-refresh/runtime",
            { name: "react", target: "react@17" }
          ]
        }
      },
      injects: [
        "https://unpkg.com/wpmjs@2/dist/index.js",
      ],
    })
  ]
}
```

## If you need to generate multiple instances of a package, that is, different versions appear at the same time, you need to see the following example. If you need a single instance, you don't need to pay attention to it

Remote single instance and multi instance configurations are determined by the identifier at the key, as shown in the following three webpack.config JS, which are 【a】, 【b】 and 【C】 in the order of introduction:

*【A】 The "react" of 【a】 and 【b】 projects will use the first registered“ react@17 "Corresponding" https://assets.weimob.com/react @17/umd/react.development. JS "in this version, the" react "reference in the two projects is a singleton
*【B】 If the project is used independently or introduced before the project 【a】“ react@17 "Can use" https://assets.weimob.com/react/umd/react.development.js "This version
*【A】 And "react" of 【c】 project will use "XX. Com"/ react@17 /umd/xx.js"、"xx.com/ react@18 /umd/xx. JS "there are many" react "references in these two versions and two projects

``` js
// webpack.config.A.js
remotes: {
    "react@17": "https://unpkg.com/react@17/umd/react.development.js"
}

// webpack.config.B.js
remotes: {
    "react@17": "https://unpkg.com/react/umd/react.development.js"
}

// webpack.config.C.js
remotes: {
    "react": "http://https://unpkg.com/react@18/umd/react.development.js"
}
```