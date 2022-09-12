const { getEntrySet } = require("./utils")
const {stringifyRequest, parseQuery} = require("loader-utils")
const path = require("path")
const packageJson = require(path.join(process.cwd(), "package.json"))
const {modulePath: virtualInitConfigPath} = require("./virtualModule/initConfig")

module.exports = function lod (source, map, meta) {
  if (this._compiler.__mfplugin__entryResources.has(this.resourcePath + this.resourceQuery)) {
    return `
    require("${virtualInitConfigPath}")
    \r\n;
    ${source}
    `
  }
  this.callback(null, source, map, meta)
  return
}