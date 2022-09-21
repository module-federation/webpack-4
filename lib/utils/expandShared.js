const path = require("path")
const resolveCwd = require("resolve-cwd");
const packageDirectorySync = require("pkg-dir").sync

/**
 * shared简写展开为object
 * shared: ["react"] => shared: {react: {.....}}
 * shared: {react: "version"} => shared: {react: {.....}}
 * @param {*} shared 
 */
module.exports.expandShared = function expandShared(shared = {}, shareScope = "") {
  const resultShared = {}
  if (shared instanceof Array) {
    shared.forEach(share => {
      resultShared[share] = _expandShare({}, share, shareScope)
    })
  } else {
    Object.keys(shared).forEach(key => {
      if (typeof shared[key] === "string") {
        resultShared[key] = _expandShare({ version: key }, key, shareScope)
      } else {
        resultShared[key] = _expandShare(shared[key], key, shareScope)
      }
    })
  }
  return resultShared
}

function _expandShare(share = {}, name, shareScope) {
  return {
    import: share.import || name,
    eager: share.eager || false,
    requiredVersion: share.requiredVersion || "*",
    shareScope: share.shareScope || shareScope,
    singleton: share.singleton || false,
    version: share.version || require(path.join(packageDirectorySync(resolveCwd(name)), "package.json")).version,
    eager: share.eager || false,
    strictVersion: share.strictVersion || false,
  } 
}
