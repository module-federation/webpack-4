const {stringifyRequest, parseQuery} = require("loader-utils")
const path = require("path")

function wpmPkgCode (pkgName) {
  return `
  /* eslint-disable */
  // 使用window.xxx避免被压缩删掉
  if (window.__wpm__importWpmLoader__garbage) {
    window.__wpm__importWpmLoader__garbage = "__wpm__importWpmLoader__wpmPackagesTag${pkgName}__wpm__importWpmLoader__wpmPackagesTag";
  }
  module.exports = window.System.__wpmjs__.get("${decodeURIComponent(pkgName)}")
  `
}

module.exports = function lod (source) {
  const query = parseQuery(this.resourceQuery || "?") || {}
  // if ('wpm' in query && query.type === "wpmPkg") {
  return wpmPkgCode(query.pkgName)
  // }
  
}
