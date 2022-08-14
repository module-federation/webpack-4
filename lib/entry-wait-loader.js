const { getEntrySet } = require("import-wpm-webpack-plugin/lib/utils")
const {stringifyRequest, parseQuery} = require("loader-utils")
const path = require("path")
const packageJson = require(path.join(process.cwd(), "package.json"))

let entryStringSet = null
const entryOriginCodeMap = {}

module.exports = function lod (source, map, meta) {
  if (entryStringSet == null) {
    entryStringSet = getEntrySet(this._compiler)
  }

  if (entryStringSet.has(this.resourcePath)) {
    const query = parseQuery(this.resourceQuery || "?") || {}
    if ('wpm' in query && query.type === "entry") {
      this.callback(null, entryOriginCodeMap[this.resourcePath], map, meta)
      return
    } else {
      entryOriginCodeMap[this.resourcePath] = source
      if (this._compiler.options.output.libraryTarget === "system") {
        return `
        /* eslint-disable */
        const chunkId = "__wpm__entryWaitLoaderChunkId"
        const wpmPackages = window.__wpm__plugin.chunkMap["${packageJson.name}__" + chunkId]
        module.exports = window.__wpm__plugin.wait(wpmPackages).then(function (res) {
          return require(${stringifyRequest(this, `${this.resourcePath}?wpm&type=entry${this.resourceQuery.replace("?", "&")}`)})
        })
        `
      } else {
        // TODO: 兼容微盟微前端
        return `
        /* eslint-disable */
        const proxymise = require("proxymise")
        module.exports = proxymise(function () {
          const chunkId = "__wpm__entryWaitLoaderChunkId"
          const wpmPackages = window.__wpm__plugin.chunkMap["${packageJson.name}__" + chunkId]
          return window.__wpm__plugin.wait(wpmPackages).then(function (res) {
            return require(${stringifyRequest(this, `${this.resourcePath}?wpm&type=entry${this.resourceQuery.replace("?", "&")}`)})
          })
        }())
        `
      }
    }
  }
  this.callback(null, source, map, meta)
  return
}