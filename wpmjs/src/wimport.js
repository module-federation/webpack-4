import proxymise from 'proxymise';
import { merge } from "lodash-es"

if (!window.System) {
  // 重复运行systemjs会导致异常
  require("systemjs/dist/s")
  require("systemjs/dist/extras/amd")
  require("systemjs/dist/extras/module-types")
}
require("./hack")

const pkgCache = {
  // [pkg]: {
  //   module,
  //   promise
  // }
};

function defaultResolveModule({url, entry = ''}){
  return window.System.import(url)
}

function defaultResolvePath() {
  throw new Error("请实现resolvePath函数（ new ImportHttpPlugin({init: {resolvePath}}) ）")
}

const config = { env: '', map: {}, dev: false};
const eventMap = new Map()

function getPkgInfo (pkgname) {
  var {1: name, 5: version = 'latest', 6: entry = "", 9: query = ""} = pkgname.match(/^((@[_\-A-Za-z\d]+\/)?([_\-A-Za-z\d]+))(@(.+?))?(\/([_\-A-Za-z\d/]+))?(\?(.+?))?$/) || []
  entry = entry.replace(/^\//, "")
  return {
    entry,
    name,
    version,
    query
  }
}

function getPkgUrl(pkgname) {
  if (/^https?:\/\//.test(pkgname)) {
    return {
      url: pkgname,
    }
  }

  var {
    name,
    version,
    entry='',
    query
  } = getPkgInfo(pkgname)
  if (!name) {
    throw new Error("请传入正确的包名:[@]pkgName[@latest | @x.x]")
  }
  let importOptions = {name, version, query, entry}
  let resolveImportOptions = {...importOptions}
  // 解析请求参数
  const onResolveSet = eventMap.get("resolve") || new Set()
  for (let onResolve of onResolveSet) {
    Object.assign(resolveImportOptions, onResolve(resolveImportOptions) || {})
  }
  Object.assign(importOptions, resolveImportOptions)
  var {name, version, query, entry} = importOptions

  // 解析path
  const onResolvePathSet = eventMap.get("resolvePath") || new Set()
  let resPath = ""
  for (let onResolvePath of onResolvePathSet) {
    resPath = onResolvePath({ name, version, query, entry, env: config.env })
    if (resPath) break
  }
  
  return {
    url: resPath || defaultResolvePath(),
    entry
  }
}

function setConfig(customConfig = {}) {
  merge(config, customConfig);
}

function wimportSync(pkgname) {
  return pkgCache[pkgname]?.module;
}

function wimport(pkgname) {
  if(typeof pkgname !== 'string') {
    throw new Error('包名不是字符串!');
  }

  if(pkgCache[pkgname]) {
    return pkgCache[pkgname].promise;
  }

  const pkgUrl = getPkgUrl(pkgname);
  // 解析module
  let module = null
  const onResolveModuleSet = eventMap.get("resolveModule") || new Set()
  for (let onResolveModule of onResolveModuleSet) {
    module = onResolveModule({
      url: pkgUrl.url,
      entry: pkgUrl.entry
    })
    if (module) break
  }

  const pkgPromise = proxymise(Promise.resolve(module || defaultResolveModule({
    url: pkgUrl.url,
    entry: pkgUrl.entry
  })));

  pkgCache[pkgname] = {
    promise: pkgPromise,
    module: null,
  }
  pkgPromise.then(res => pkgCache[pkgname].module = res);

  return pkgPromise;
}

let inited = false
wimport.init = function (initConfig) {
  if (!initConfig) initConfig = {}
  if (inited) {
    // 以首次设置的env为准
    initConfig.env = config.env
  }
  Object.keys(config.map).forEach(mapKey => {
    // 以首次设置的map[pkg]为准
    delete (initConfig.map || {})[mapKey]
  })
  if (typeof initConfig.resolvePath === "function" && !config.resolvePath) {
    // 以首次设置的resolvePath为准
    wimport.on("resolvePath", initConfig.resolvePath)
  }
  setConfig(initConfig)
  inited = true
};
wimport.pkgCache = pkgCache;

wimport.setConfig = setConfig;
wimport.getConfig = () => config;
wimport.import = wimport
wimport.get = wimportSync
wimport.sync = wimportSync
wimport.on = function (event, cb) {
  let set = eventMap.get(event) || new Set()
  set.add(cb)
  eventMap.set(event, set)
}
wimport.off = function (event, cb) {
  let set = eventMap.get(event) || new Set()
  set.remove(cb)
}

// map拦截
wimport.on("resolve", ({name = "", version = "", query = "", entry = ""} = {}) => {
  const map = config.map || {}
  const importPkg = `${name}@${version}${entry}?${query}`
  let result = {name, version, query, entry}
  Object.keys(map).forEach(pkgstr => {
    const {name: mapName, version: mapVersion, query: mapQuery, entry: mapEntry = ""} = getPkgInfo(pkgstr)
    if (importPkg.startsWith(`${mapName}@${mapVersion}${mapEntry}?${mapQuery}`)) {
      result = getPkgInfo(map[pkgstr])
      Object.keys(result).forEach(key => {
        if (!result[key]) {
          // map只覆盖设置的选项, 未设置的不改变
          delete result[key]
        }
      })
    }
  })
  return result
})

// dev模式拦截
wimport.on("resolve", ({name = ""} = {}) => {
  if (config.dev) {
    if (name === "react" || name === "react-dom" || name === "vue") {
      return {
        name: name + "-dev"
      }
    }
  }
})

const wpmDebugMap = (function () {
  try {
    return JSON.parse(localStorage.getItem("wpm-debug-map")) || {}
  } catch (e) {
    return {}
  }
})()

// debug拦截
wimport.on("resolve", ({name = ""} = {}) => {
  // 拦截, 使用调试map
  if(wpmDebugMap[name]) {
    const result = getPkgInfo(wpmDebugMap[name])
    Object.keys(result).forEach(key => {
      if (!result[key]) {
        // map只覆盖设置的选项, 未设置的不改变
        delete result[key]
      }
    })
    return result
  }
  // 不拦截
  return undefined
})

export default wimport;