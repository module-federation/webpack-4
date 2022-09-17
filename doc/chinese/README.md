## mf-webpack4
Module Federation of webpack4

### 在线尝试:
https://stackblitz.com/github/wpmjs/wpmjs/tree/main/examples/mf-webpack4

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
3. shared: {react: {eager, requiredVersion, shareScope, singleton, version}}
```

### remotes
```
remotes: {
    "app2": "app2@http://localhost:9002/remoteEntry.js"
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