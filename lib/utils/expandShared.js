/**
 * shared简写展开为object
 * shared: ["react"] => shared: {react: {.....}}
 * shared: {react: "version"} => shared: {react: {.....}}
 * @param {*} shared 
 */
export default function expandShared(shared = {}, from = "", shareScope = "") {
  const resultShared = {}
  if (shared instanceof Array) {
    shared.forEach(share => {
      resultShared[share] = _expandAShare({}, share, from, shareScope)
    })
  } else {
    Object.keys(shared).forEach(key => {
      if (typeof shared[key] === "string") {
        resultShared[key] = _expandAShare({ version: key }, key, from, shareScope)
      } else {
        resultShared[key] = _expandAShare(shared[key], key, from, shareScope)
      }
    })
  }
  return resultShared
}

function _expandAShare(share = {}, name, from, shareScope) {
  return {
    // import,
    from,
    eager: config.eager || false,
    requiredVersion: share.requiredVersion || "*",
    shareScope: share.shareScope || shareScope,
    singleton: share.singleton || false,
    version: share.version || require(path.join(packageDirectorySync(resolveCwd(name)), "package.json")).version,
    loaded: share.eager ? 1 : false,
    eager: share.eager || false,
    strictVersion: share.strictVersion || false,
  } 
}
