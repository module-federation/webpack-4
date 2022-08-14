const entryWait = require("./entry-wait-loader")

module.exports = function lod (source) {
  source = entryWait.apply(this, arguments)
  return source
}