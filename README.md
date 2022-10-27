## Module Federation of webpack4

[![npm](https://img.shields.io/npm/v/@module-federation/webpack-4.svg)](https://www.npmjs.com/package/@module-federation/webpack-4)

[中文文档](doc/chinese)


### Try online:
* [webpack4 + webpack5](https://stackblitz.com/github/wpmjs/wpmjs/tree/main/examples/mf-webpack4)
* [vue-cli + umi-react](https://stackblitz.com/github/wpmjs/wpmjs/tree/main/examples/vue-cli-umi-react)

### Examples:
``` js
// webpack.config.js
const MF = require("@module-federation/webpack-4")
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

## Differences with webpack5
[module-federation/webpack-4](https://www.npmjs.com/package/@module-federation/webpack-4)The plugin has implemented the main capabilities of module-federation, and can be found in [webpack4 and webpack5 refer to each other](https://stackblitz.com/github/wpmjs/wpmjs/tree/main/examples/module-federation/webpack-4) , The following describes which parameters are not supported by the plugin

## unsupported parameter

### options.library
The priority of this parameter is not very high, the implementation in webpack4 is more complicated, and there are still problems in using it in webpack5, see for details "https://github.com/webpack/webpack/issues/16236" , Therefore, the implementation in webpack4 is similar to setting library.type = "global"

### options.remotes.xxx.shareScope
The same mf container can only be initialized with one shareScope. If inconsistent webpack is set by using shareScope multiple times, it will report an error, and the shareScope can be set too much, which is confusing. Even in pure webpack5, the performance is unpredictable. It is recommended to use options. shared.xxx.shareScope, options.shareScope alternative

### module-federation ecological package
The webpack-4 plugin has not yet integrated the ability of webpack-5 related packages（[ssr、typescript、hmr、dashboard...](https://github.com/module-federation)）, However, 4 and 5 interoperability has been achieved, which can help you to use webpack5 to implement new projects without refactoring existing projects.