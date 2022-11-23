module.exports = function getWpmjs() {
  const usemf = require('usemf')
  const resolveRequest = require('semverhook/src/utils/resolveRequest')
  const obj = {
    idUrlMap: {
    },
    idDefineMap: {
      // id: {
      //   // "promise"返回的是mf的规范{get(){},init(){}}
      //   remoteType: "mf" | "promise",
      //   name,
      // }
    },
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
      return Promise.all(pkgs.map((pkg) => {
        return this.import(pkg)
      }))
    },
    getMFContainer(id, customGetContainer) {
      const request = resolveRequest(id)
      const remoteType = this.idDefineMap[request.name].remoteType
      // mf模块
      const config = this.idDefineMap[request.name]
      return usemf.getContainer({
        url: this.idUrlMap[request.name],
        name: config.name,
        customGetContainer: remoteType === "promise" ? 
          () => new Function(`return ${this.idUrlMap[request.name]}`)() :
          customGetContainer,
      })
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
      const importPromise = Promise.resolve(
        (async () => {
          if (id.startsWith("mfshare:")) {
            return this._importShare(id)
          }
          const request = resolveRequest(id)
          const remoteType = this.idDefineMap[request.name].remoteType
          // mf模块
          const config = this.idDefineMap[request.name]
          return this._resolveMfEntry(usemf.import({
            url: this.idUrlMap[request.name],
            name: config.name,
            customGetContainer: remoteType === "promise" ? () => new Function(`return ${this.idUrlMap[request.name]}`)() : undefined,
          }), request)
        })()
      )
      return this.idModulePromiseMap[id] = importPromise.then(res => {
        this.idModuleMap[id] = res
        return res
      })
    },
    async _importShare(id) {
      id = id.replace("mfshare:", "")
      const [scope, pkg, version] = id.indexOf(":") > -1 ? id.split(":") : id.split("/")
      const fn = await usemf.getShareScopes()[scope][pkg][version].get()
      return fn()
    },
    /**
     * 解析mf入口
     * @param {*} modulePromise 
     * @param {*} id 
     * @returns 
     */
    async _resolveMfEntry(loadModule, request) {
      await loadModule.continerInitPromise
      const {entry} = request
      if (entry) {
        return loadModule("./" + entry)
      }
      return loadModule()
    },
    setConfig,
  }

  function setConfig(customConfig) {
    customConfig = customConfig || {}
    const {
      idUrlMap = {},
      idDefineMap = {},
    } = customConfig
    Object.keys(idUrlMap).forEach(key => {
      if (key in this.idUrlMap) return
      this.idUrlMap[key] = idUrlMap[key]
    })
    Object.keys(idDefineMap).forEach(key => {
      if (key in this.idDefineMap) return
      this.idDefineMap[key] = idDefineMap[key]
    })
  }

  return obj
}