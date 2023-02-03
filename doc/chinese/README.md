## Module Federation of webpack4

<!-- [![npm](https://img.shields.io/npm/v/@module-federation/webpack-4.svg)](https://www.npmjs.com/package/@module-federation/webpack-4) -->
[![npm](https://img.shields.io/npm/v/mf-webpack4.svg)](https://www.npmjs.com/package/mf-webpack4)

支持 [universal-module-federation-plugin](https://github.com/zhangHongEn/universal-module-federation-plugin/tree/main/packages/universal-module-federation-plugin)

### 在线尝试:
* [webpack4 + webpack5](https://stackblitz.com/github/wpmjs/examples/tree/main/webpack4-module-federation/webpack4-5-module-federation)
* [vue-cli + umi-react](https://stackblitz.com/github/wpmjs/examples/tree/main/webpack4-module-federation/webpack4-vue-cli-umi-react)
    * [vue-cli 注意事项](https://github.com/module-federation/webpack-4/tree/main/doc/chinese#vue-cli-注意事项)

### 示例:
``` js
// webpack.config.js
const MF = require("mf-webpack4")
module.exports = {
  plugins: [

    new MF({
      remotes: {
        "app2": "app2@http://localhost:9002/remoteEntry.js",
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

## Options
### shared
https://webpack.js.org/plugins/module-federation-plugin/
``` js
1. shared: ["react"]
2. shared: {react: "17.0.2"}
3. shared: {react: {"import", eager, requiredVersion, shareScope, singleton, version}}
```

### remotes
```
remotes: {
    "app2": "app2@http://localhost:9002/remoteEntry.js",
    "promiseRemote": `promise {
      init() {},
      get() {
        return function () {
          return {
            promiseRemote: "aaaa"
          }
        }
      }
    }`
}
```

### name
library required name

### filename
default "remoteEntry.js"

### exposes
```
exposes: {
    "./App": "./src/App"
}
```

## 注意事项

### vue-cli 注意事项
```
// vue.config.js
const MF = require("mf-webpack4")

module.exports = {
  // TODO: 1. parallel = false
  // 疑似 "webpack-virtual-modules" 与 "thread-loader" 配合有bug, 在打包阶段会报错
  parallel: false,
  chainWebpack(chain) {
    // TODO: 2. clear splitChunks
    // vue-cli的splitChunks策略需要配合index.html使用， 在入口加载main.js、chunks.js...。MF的入口只有一个文件remoteEntry.js, 策略有冲突, 需要重置
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

## 与webpack5的差异
@module-federation/webpack-4插件已经实现了module-federation的主要能力, 并且可以在[webpack4和webpack5互相引用](https://stackblitz.com/github/wpmjs/wpmjs/tree/main/examples/mf-webpack4) , 下面说明下哪些参数是插件是未支持的

## 不支持的参数

### options.library
此参数优先级不是很高, 在webpack4种实现较为复杂, 在webpack5中使用也仍有问题, 详见https://github.com/webpack/webpack/issues/16236 , 故在webpack4中的实现类似于设置了library.type = "global"

### options.remotes.xxx.shareScope
同一个mf container只可以用一个shareScope初始化, 如果被多次使用shareScope设置的不一致webpack会报错, 并且shareScope可设置处过多比较混乱, 即使在纯webpack5中使用表现也不可预估, 建议使用options.shared.xxx.shareScope、options.shareScope替代

### module-federation生态包
webpack-4插件暂未集成webpack-5相关包的能力（[ssr、typescript、hmr、dashboard等](https://github.com/module-federation)）, 但已实现4、5互通, 可以助您可以放心的使用webpack5实现新项目, 而无需重构已有项目