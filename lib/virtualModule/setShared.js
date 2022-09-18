const path = require("path")
module.exports.modulePath = path.join(process.cwd(), "$_mfplugin_virtualSetShared/index.js")
const {modulePath: virtualLocalSharedPath} = require("./localShared")

module.exports.getSetSharedModule = function (pluginInstance) {
  const {options} = pluginInstance
  return `
  /* eslint-disable */
  const usemf = window.usemf
  const shareScopes = usemf.getShareScopes()
  const rangesMaxSatisfying = require("semver/ranges/max-satisfying")
  const localShared = require("${virtualLocalSharedPath}")
  const usedShared = {}
  let firstInit = true

  mergeShared(shareScopes, localShared)

  // 如果usemf的scopes不是源头, 需要使用源头的scopes
  export function setInitShared(scopeShared = {}) {
    var scope = "${options.shareScope || "default"}"
    if (firstInit) {
      // 是第一次container.init则使用scopeShare替代shareScopes[scope]
      firstInit = false
      shareScopes[scope] = scopeShared
      mergeShared(shareScopes, localShared)
    }
    // 非第一次container.init, 则验证多次init的scope是否一致
    var oldScope = shareScopes[scope]
    if(oldScope && oldScope !== scopeShared) {
      throw new Error("Container initialization failed as it has already been initialized with a different share scope")
    }
    mergeShared(shareScopes, scopeShared)
  }

  function mergeShared(shareScopes, scopeShared) {
    Object.keys(scopeShared).forEach(name => {
      const pkg = localShared[name]
      if (!shareScopes[pkg.shareScope]) shareScopes[pkg.shareScope] = {}
      shareScopes[pkg.shareScope][name] = shareScopes[pkg.shareScope][name] || {}
      const pkgInfo = shareScopes[pkg.shareScope][name]
      pkgInfo[pkg.version] = pkgInfo[pkg.version] || pkg
    })
  }

  export function getUsedShare(pkg) {
    if (usedShared[pkg]) return usedShared[pkg]
    const localPkgConfig = localShared[pkg]
    const shareScope = localShared[pkg].shareScope
    const pkgVersions = shareScopes[shareScope][pkg]
    const rangeMax = rangesMaxSatisfying(Object.keys(pkgVersions), localShared[pkg].requiredVersion)
    const max = rangesMaxSatisfying(Object.keys(pkgVersions), "*")
    const loadedShare = Object.keys(pkgVersions).map(version => pkgVersions[version]).filter(pkg => !!pkg.loaded).map(pkg => pkg.version)[0]
    const useShareVersion = localPkgConfig.singleton ? 
      loadedShare || rangeMax || max :
      rangeMax || max
    if (localPkgConfig.strictVersion && !rangesMaxSatisfying([useShareVersion], localPkgConfig.requiredVersion)) {
      throw new Error(\`Unsatisfied version \${useShareVersion} from app1 of shared singleton module react (required \${localPkgConfig.requiredVersion})
      at getStrictSingletonVersion \`)
    }
    usedShared[pkg] = {
      version: useShareVersion,
      shareScope
    }
    return usedShared[pkg]
  }

  export function initShared() {
    const plugin = window["__mfplugin__${options.name}"]
    if (!plugin.initSharedPromise) {
      plugin.initSharedPromise = Promise.all([${Object.keys(pluginInstance.wpmInitConfig.idUrlMap).map(id => {
        return `window.wpmjs.import("${id}").then(loadModule => loadModule.continerInitPromise)`
      }).join(",")}])
    }
    return plugin.initSharedPromise
  }
  export function getShareScopes() {
    return usemf.getshareScopes()
  }
  `
}