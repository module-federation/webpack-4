const {stringifyRequest, parseQuery} = require("loader-utils")
const path = require("path")

function wpmPkgCode ({pkgName, importType = "sync", mfName = ""}) {
  if (importType === "sync") {
    return `
    /* eslint-disable */
    // 使用window.xxx避免被压缩删掉
    if (window.__wpm__importWpmLoader__garbage) {
      window.__wpm__importWpmLoader__garbage = "__wpm__importWpmLoader__wpmPackagesTag${pkgName}__wpm__importWpmLoader__wpmPackagesTag";
    }
    module.exports = window["__mfplugin__${mfName}"].get("${decodeURIComponent(pkgName)}")
    `
  }
  return `
  module.exports = window["__mfplugin__${mfName}"].import("${decodeURIComponent(pkgName)}")  
  `
}

module.exports = function lod (source) {
  const query = parseQuery(this.resourceQuery || "?") || {}
  return wpmPkgCode(query)
}
