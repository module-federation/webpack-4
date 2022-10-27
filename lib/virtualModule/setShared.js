const path = require("path")
module.exports.modulePath = path.join(process.cwd(), "$_mfplugin_virtualSetShared/index.js")
const {modulePath: virtualLocalSharedPath} = require("./localShared")

module.exports.getSetSharedModule = function (pluginInstance) {
  const {options} = pluginInstance
  return `
  /* eslint-disable */
  const usemf = window.usemf
  const shareScopes = usemf.getShareScopes()
  const localShared = require(${JSON.stringify(virtualLocalSharedPath)})
  const usedShared = {}
  let firstInit = true

  mergeShared(localShared, shareScopes)

  function mergeShared(scopeShared, shareScopes = window.usemf.getShareScopes()) {
    Object.keys(scopeShared).forEach(name => {
      const pkg = scopeShared[name]
      const {shareScope = "default", version} = pkg
      if (!shareScopes[shareScope]) shareScopes[shareScope] = {}
      shareScopes[shareScope][name] = shareScopes[shareScope][name] || {}
      const pkgInfo = shareScopes[shareScope][name]
      pkgInfo[version] = pkgInfo[version] || {
        loaded: pkg.loaded,
        get() {
          pkgInfo[version].loaded = 1
          return pkg.get()
        },
        from: pkg.from,
        eager: pkg.eager
      }
    })
  }

  // 如果usemf的scopes不是源头, 需要使用源头的scopes
  export function setInitShared(scopeShared = {}) {
    var scope = "${options.shareScope || "default"}"
    if (firstInit) {
      // 是第一次container.init则使用scopeShare替代shareScopes[scope]
      firstInit = false
      shareScopes[scope] = scopeShared
      mergeShared(localShared, shareScopes)
    }
    // 非第一次container.init, 则验证多次init的scope是否一致
    var oldScope = shareScopes[scope]
    if(oldScope && oldScope !== scopeShared) {
      throw new Error("Container initialization failed as it has already been initialized with a different share scope")
    }
    Object.keys(scopeShared).forEach(pkg => {
      const pkgVersionMap = scopeShared[pkg]
      Object.keys(pkgVersionMap).forEach(version => {
        mergeShared({
          [pkg]: {
            version,
            ...pkgVersionMap[version]
          }
        }, shareScopes)
      })
    })
  }

  export function getUsedShare(pkg) {
    if (usedShared[pkg]) return usedShared[pkg]
    const useShareVersion = window.usemf.getShare(pkg, localShared[pkg])
    usedShared[pkg] = {
      version: useShareVersion,
      shareScope: localShared[pkg].shareScope
    }
    return usedShared[pkg]
  }

  export function initShared() {
    const plugin = window["__mfplugin__${options.name}"]
    if (!plugin.initSharedPromise) {
      plugin.initSharedPromise = Promise.all([${Object.keys(pluginInstance.wpmInitConfig.idUrlMap).map(id => {
        return `window.wpmjs.getMFContainer("${id}").then(container => {
          return container.init(window.usemf.getShareScopes()["${options.shareScope}"])
        })`
      }).join(",")}])
    }
    return plugin.initSharedPromise
  }
  export function getShareScopes() {
    return usemf.getshareScopes()
  }
  `
}