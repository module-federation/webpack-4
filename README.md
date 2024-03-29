## Module Federation of webpack4

<!-- [![npm](https://img.shields.io/npm/v/@module-federation/webpack-4.svg)](https://www.npmjs.com/package/@module-federation/webpack-4) -->
[![npm](https://img.shields.io/npm/v/mf-webpack4.svg)](https://www.npmjs.com/package/mf-webpack4)

[中文文档](doc/chinese)

support [universal-module-federation-plugin](https://github.com/zhangHongEn/universal-module-federation-plugin/tree/main/packages/universal-module-federation-plugin)


### Try online:
* [webpack4 + webpack5](https://stackblitz.com/github/wpmjs/examples/tree/main/webpack4-module-federation/webpack4-5-module-federation)
* [vue-cli + umi-react](https://stackblitz.com/github/wpmjs/examples/tree/main/webpack4-module-federation/webpack4-vue-cli-umi-react)
    * [vue-cli matters needing attention](https://github.com/module-federation/webpack-4#vue-cli-matters-needing-attention)
* [dynamic-remotes examples](#dynamic-remotes-examples)

### config examples:
``` js
// webpack.config.js
const MF = require("mf-webpack4")
module.exports = {
  plugins: [

    new MF({
      remotes: {
        "app2": "app2@http://localhost:9002/remoteEntry.js"
      },
      name: "app1",
      filename: "remoteEntry.js",
      shared: {
        "react": {
          singleton: true,
          requiredVersion: "16",
          strictVersion: true
        },
        "react-dom": {
          singleton: false,
        }
      },
      exposes: {
        "./App": "./src/App"
      }
    })

  ]
}
```

## dynamic-remotes examples
use [module-federation-runtime](https://github.com/zhangHongEn/universal-module-federation-plugin/tree/main/packages/module-federation-runtime) instead of [webpack internal variables and dynamic loading API](https://h3manth.com/posts/dynamic-remotes-webpack-module-federation/)
``` js

// 1. __webpack_init_sharing__ 
await require("module-federation-runtime").initSharing("default")

// 2. __webpack_share_scopes__ 
require("module-federation-runtime").shareScopes

// 3. dynamic-remotes
await require("module-federation-runtime").registerRemotes({
  "mfapp01": {
    url: "https://cdn.jsdelivr.net/npm/mf-app-01/dist/remoteEntry.js"
  },
})
const AppFactory = await findModule("mfapp01", "./App")
AppFactory()
```

## Options
### shared
https://webpack.js.org/plugins/module-federation-plugin/
``` js
1. shared: ["react"]
2. shared: {react: "17.0.2"}
3. shared: {react: {"import", eager, requiredVersion, shareScope, singleton, version}}
```

### remotes
``` js
remotes: {
    "app2": "app2@http://localhost:9002/remoteEntry.js",
    "promiseRemote": `promise new Promise(resolve => resolve({
      init() {},
      get() {
        return function () {
          return {
            promiseRemote: "aaaa"
          }
        }
      }
    }))`
}
```

### name
library required name

### filename
default "remoteEntry.js"

### exposes
``` js
exposes: {
    "./App": "./src/App"
}
```

## matters needing attention

### vue-cli matters needing attention
``` js
// vue.config.js
const MF = require("mf-webpack4")

module.exports = {
  // TODO: 1. parallel = false
  // It is suspected that there is a bug in the cooperation between "webpack-virtual-modules" and "thread-loader", and an error will be reported during the packaging stage
  parallel: false,
  chainWebpack(chain) {
    // TODO: 2. clear splitChunks
    // The splitChunks strategy of vue-cli needs to be used in conjunction with index.html, and main.js, chunks.js... are loaded at the entry. The entry of MF has only one file remoteEntry.js, the policy conflicts and needs to be reset
    chain.optimization.splitChunks().clear()
    
    chain.plugin("moduleFederation")
      .use(MF, [{
        name: "vueCliRemote",
        shared: ["vue"],
        exposes: {
          "./App": "src/App.vue"
        }
      }])
  },
}
```

## Differences with webpack5
module-federation/webpack-4 The plugin has implemented the main capabilities of module-federation, and can be found in [webpack4 and webpack5 refer to each other](https://stackblitz.com/github/wpmjs/wpmjs/tree/main/examples/module-federation/webpack-4) , The following describes which parameters are not supported by the plugin

## unsupported parameter

### options.library
The priority of this parameter is not very high, see for details "https://github.com/webpack/webpack/issues/16236" , Therefore, the implementation in webpack4 is similar to setting library.type = "global"

### options.remotes.xxx.shareScope