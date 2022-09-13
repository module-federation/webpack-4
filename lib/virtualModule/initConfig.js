const path = require("path")
module.exports.modulePath = path.join(process.cwd(), "$_mfplugin_virtualInitConfig/index.js")
const {modulePath: virtualSetSharedPath} = require("./setShared")
const {modulePath: virtualLocalSharedPath} = require("./localShared")

module.exports.getInitConfigModule = function (pluginInstance) {
  const {options} = pluginInstance
  return `
  /* eslint-disable */
  require("wpmjs")
  const localShared = require("${virtualLocalSharedPath}")
  const {getUsedShare} = require("${virtualSetSharedPath}")
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
      initSharedPromise: null,
      chunkMap: {},
      get(pkg = "") {
        return window.wpmjs.get(pkgFilter(pkg))
      },
      import(pkg = "") {
        return window.wpmjs.import(pkgFilter(pkg))
      },
      wait(pkgs) {
        pkgs = pkgs || []
        return Promise.all([
          window.wpmjs.wait(pkgs.map(pkgFilter)),
          this.initSharedPromise
        ])
      }
    }
  }
  const {initShared} = require("${virtualSetSharedPath}")
  const initConfig = ${JSON.stringify(pluginInstance.wpmInitConfig)}
  window.wpmjs.setConfig(initConfig)
  window["__mfplugin__initSharedPromise__${options.name}"] = initShared()
  `
}