const path = require("path")
module.exports.modulePath = path.join(process.cwd(), "$_mfplugin_virtualInitConfig/index.js")
const {modulePath: virtualSetSharedPath} = require("./setShared")
const {modulePath: virtualLocalSharedPath} = require("./localShared")
const getWpmjsFn = require("../sdk").toString()

module.exports.getInitConfigModule = function (pluginInstance) {
  const {options} = pluginInstance
  return `
  ${getWpmjsFn}
  const wpmjs = getWpmjs()
  /* eslint-disable */
  const localShared = require(${JSON.stringify(virtualLocalSharedPath)})
  const {getUsedShare} = require(${JSON.stringify(virtualSetSharedPath)})
  function pkgFilter(pkg) {
    const [prefix, shareName] = pkg.split("mfshare:") || []
    if (shareName) {
      const {
        version,
        shareScope,
      } = getUsedShare(shareName)
      return \`mfshare:\${shareScope}:\${shareName}:\${version}\`
    }
    return pkg
  }
  if (!window["__mfplugin__${options.name}"]) {
    window["__mfplugin__${options.name}"] = {
      wpmjs,
      initSharedPromise: null,
      chunkMap: {},
      get(pkg = "") {
        return wpmjs.get(pkgFilter(pkg))
      },
      import(pkg = "") {
        return wpmjs.import(pkgFilter(pkg))
      },
      async wait(pkgs) {
        await this.initSharedPromise
        pkgs = pkgs || []
        return Promise.all([
          wpmjs.wait(pkgs.map(pkgFilter))
        ])
      }
    }
  }
  const {initShared} = require(${JSON.stringify(virtualSetSharedPath)})
  const initConfig = ${JSON.stringify(pluginInstance.wpmInitConfig)}
  wpmjs.setConfig(initConfig)
  window["__mfplugin__initSharedPromise__${options.name}"] = initShared()
  `
}