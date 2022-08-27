import preget from 'pre-get';
import resolveRequest from './utils/resolveRequest';

const obj = {
  env: '',
  dev: localStorage.getItem('wpm-debug-open') == 1,
  idConfigMap: {
  },
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
    map = {},
    resolvePath,
    dev = obj.dev,
    env
  } = customConfig
  if (obj.env)
  obj.dev = dev
  Object.keys(map).forEach(key => {
    if (key in this.idConfigMap) return
    this.idConfigMap[key] = map[key]
  })
  if (resolvePath) {
    obj.resolvePath = resolvePath
  }
}

export default obj