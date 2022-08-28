import preget from 'pre-get';
import resolveRequest from './utils/resolveRequest';

const obj = {
  env: null,
  dev: null,

  idUrlMap: {
  },
  idDefineMap: {},
  devIdUrlMap: {},
  urlIdMap: {},
  idModuleMap: {},
  idModulePromiseMap: {},
  get (id) {
    return this.idModuleMap[id]
  },
  import(id) {
    return this.idModulePromiseMap[id] || (this.idModulePromiseMap[id] = this.resolveModule(window.System.import(id), id))
  },
  resolvePath(request) {
    throw new Error(`请实现resolvePath函数（ new ImportHttpPlugin({
      init: {
        resolvePath: function (request) {
          // request[env、name、version、entry、query]
          return url
        }
      }
    }) ）`, request)
  },
  resolveEntryFile(request) {
    return ""
  },
  resolveQuery(request) {
    return request.query ? `?${request.query}` : ""
  },
  resolveModule(modulePromise, id) {
    return modulePromise.then(res => {
      if (/^https?:\/\//.test(id)) return res
      if (typeof res === "object" || typeof res === "function") {
        const {entry} = resolveRequest(id)
        if (entry && res[entry]?.__wpm__entry) {
          return res[entry]()
        }
      }
      return res
    })
    .then(res => {
      this.idModuleMap[id] = res
      return res
    })
  },
  setConfig,
}
;["resolveEntryFile", "resolvePath", "resolveQuery"].forEach(name => {
  obj[name].__wpm__defaultProp = true
})
// window.wpmjs = Object.assign(function (id) {
//   return obj.import(id)
// }, obj)
// window.wpmjs.init = obj.setConfig
// window.wpmjs.sync = obj.get

if (!window.System.__wpmjs__) {
  window.System.__wpmjs__ = obj
}

require("./utils/mapResolve")
require("./utils/hackWebpackLibrary")
require("./utils/addDeps")
require("./utils/hackWebpackExportPromise")

function setConfig(customConfig = {}) {
  const {
    idUrlMap = {},
    idDefineMap = {},
    devIdUrlMap = {},
    resolvePath,
    dev,
    env,
    resolveEntryFile,
    resolveQuery,
  } = customConfig
  if (obj.env == null) obj.env = env
  if (obj.dev == null) obj.dev = dev
  Object.keys(idUrlMap).forEach(key => {
    if (key in this.idUrlMap) return
    this.idUrlMap[key] = idUrlMap[key]
    this.urlIdMap[idUrlMap[key].split("?")[0]] = key
  })
  if (obj.dev) {
    Object.keys(devIdUrlMap).forEach(key => {
      if (key in this.devIdUrlMap) return
      this.devIdUrlMap[key] = devIdUrlMap[key]
      this.idUrlMap[key] = devIdUrlMap[key]
      this.urlIdMap[devIdUrlMap[key].split("?")[0]] = key
    })
  }
  Object.keys(idDefineMap).forEach(key => {
    if (key in this.idDefineMap) return
    this.idDefineMap[key] = idDefineMap[key]
  })
  if (resolvePath && obj.resolvePath.__wpm__defaultProp) {
    obj.resolvePath = resolvePath
  }
  if (resolveEntryFile && obj.resolveEntryFile.__wpm__defaultProp) {
    obj.resolveEntryFile = resolveEntryFile
  }
  if (resolveQuery && obj.resolveQuery.__wpm__defaultProp) {
    obj.resolveQuery = resolveQuery
  }
}

export default obj