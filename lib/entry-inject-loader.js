const path = require("path")
const {modulePath: virtualInitConfigPath} = require("./virtualModule/initConfig")

module.exports = function lod (source, map, meta) {
  if (module.exports.entryResources.has(this.resourcePath + this.resourceQuery)) {
    return `
    require("${virtualInitConfigPath}")
    \r\n;
    ${source}
    `
  }
  this.callback(null, source, map, meta)
  return
}
module.exports.entryResources = new Set()