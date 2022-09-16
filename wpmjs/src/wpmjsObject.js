import preget from 'pre-get';
import usemf from '/Users/zhanghongen/Desktop/open-code/usemf/dist/index.js'
import resolveRequest from './utils/resolveRequest';

const obj = {
  env: null,
  dev: null,
  idUrlMap: {
  },
  idDefineMap: {
    // id: {
    //   // "" 表示umd或system
    //   remoteType: "" | "mf",
    //   name,
      // shared: {
      //   shareScope,
      //   react: {
      //     version,
      //     loaded,
      //     get,
      //   },
      // }
    //   deps: [
    //     "",
    //     {
    //       name,
    //       target
    //     }
    //   ],
    // }
  },
  devIdUrlMap: {},
  urlIdMap: {},
  idModuleMap: {},
  idModulePromiseMap: {},
  get (id) {
    return this.idModuleMap[id]
  },
  wait (pkgs) {
    if (!(pkgs instanceof Array)) {
      throw new Error("wait(pkgs)入参需要是数组")
    }
    if (pkgs.length === 0) {
      return Promise.resolve()
    }
    return Promise.all(pkgs.map(function (pkg){
      return window.wpmjs.import(pkg)
    }))
  },
  /**
   * dep发起的请求, 不会进此api
   * id: @scope....
   * id: https?://xxx.com/xxxxx
   * id: mfshare:scope:version:react
   * @param {*} id 
   * @returns 
   */
  import(id) {
    if (this.idModulePromiseMap[id]) return this.idModulePromiseMap[id]
    const importPromise = preget(Promise.resolve(
       (async () => {
        if (/^https?:\/\//.test(id)) return window.System.import(id)
        if (id.startsWith("mfshare:")) {
          return this._importShare(id)
        }
        const request = resolveRequest(id)
        if (this.idDefineMap[request.name]?.remoteType === "mf") {
          // mf模块
          const config = this.idDefineMap[request.name]
          return this._resolveMfEntry(usemf.import({
            url: this.idUrlMap[request.name],
            name: config.name,
          }), request)
        }
        // amd umd system等模块规范, 使用systemjs.import
        this._resolveWpmEntry(window.System.import(id), request)
      })()
    ))
    return this.idModulePromiseMap[id] = importPromise.then(res => {
      this.idModuleMap[id] = res
      return res
    })
  },
  async _importShare(id) {
    const [prefix, scope, pkg, version] = id.split(":")
    const fn = await usemf.getShareScopes()[scope][pkg][version].get()
    return fn()
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
  /**
   * 如有入口, 解析入口
   * 例: import "app/a" 入口则为 "a"
   * @param {*} modulePromise 
   * @param {*} id 
   * @returns 
   */
  _resolveWpmEntry(modulePromise, request) {
    const {entry} = request
    return modulePromise.then(res => {
      if (typeof res === "object" || typeof res === "function") {
        if (entry && res[entry]?.__wpm__entry) {
          return res[entry]()
        }
      }
      return res
    })
  },
  /**
   * 解析mf入口
   * @param {*} modulePromise 
   * @param {*} id 
   * @returns 
   */
  async _resolveMfEntry(loadModule, request) {
    const {entry} = request
    if (entry) {
      return loadModule("./" + entry)
    }
    return loadModule
  },
  setConfig,
}
;["resolveEntryFile", "resolvePath", "resolveQuery"].forEach(name => {
  obj[name].__wpm__defaultProp = true
})

if (!window.System.__wpmjs__) {
  window.System.__wpmjs__ = obj
   /**
   * 放全局变量
   */
  window.wpmjs = obj
  /**
   * 兼容公司内旧版本用法
   */
  window.wpmjs.init = obj.setConfig
  window.wpmjs.sync = obj.get
}

require("./utils/mapResolve")
require("./utils/hackWebpackLibrary")
require("./utils/addDeps")
require("./utils/hackWebpackExportPromise")

function setConfig(customConfig) {
  customConfig = customConfig || {}
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