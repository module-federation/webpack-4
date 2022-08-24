const path = require("path")
const webpack = require("webpack")
const pkgDir = require("pkg-dir")

module.exports.getEntrySet = function (compiler) {
  const extensions = (compiler.options.resolve || {}).extensions || []
  extensions.unshift("")
  function entryToStringArray (entry) {
    if (entry instanceof Array) {
      return entry.map(entryItem => entryToStringArray(entryItem))
        .reduce((p, n) => p.concat(n))
    } else if (typeof entry === "object") {
      return Object.keys(entry).map(name => entryToStringArray(entry[name]))
        .reduce((p, n) => p.concat(n))
    } else if (typeof entry === "string") {
      return [entry]
    }
  }
  return new Set(
    entryToStringArray(compiler.options.entry)
      .map(entryPath => entryPath.startsWith("/") ? entryPath : path.join(compiler.context, entryPath))
      .map(url => url.replace(/(\?|\!|\#).*$/, ""))
      .map(url => {
        for (let index = 0; index < extensions.length; index++) {
          const extension = extensions[index];
          if (fs.existsSync(url + extension) && fs.statSync(url + extension).isFile()) {
            return url + extension
          }
        }
      })
  ) 
}

module.exports.setEntry = function (optionsEntry, cb) {
  function entryToStringArray (entry) {
    if (entry instanceof Array) {
      return entry.map(entryItem => entryToStringArray(entryItem))
        .reduce((p, n) => cb(p) | cb(n))
    } else if (typeof entry === "object") {
      return Object.keys(entry).forEach(name => {
        entry[name] = cb(entry[name])
      })
    } else if (typeof entry === "string") {
      return [entry]
    }
  }
}

module.exports.stringifyHasFun = function (obj) {
  return JSON.parse(JSON.stringify({
    ...obj,
    toJSON () {
        const funJSON = []
        let hasFunction = false
        let hasOther = false
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] !== "function") {
                hasOther = true
                return
            }
            hasFunction = true

            const [args, body] = obj[key].toString().match(/\(([.\s\S]*?\))|(\{[.\s\S]*)\}/g)
           funJSON.push(`"${key}": function ${args} ${body}`)
        })
        return JSON.stringify(obj).replace(/\}$/, `${hasFunction && hasOther ? "," : ""}${funJSON.join(",")}}`)
    }
  }))
}

/**
 * @callback MatchObject
 * @param {string} [str]
 * @returns {boolean}
 */

/**
 * @typedef {Object} InjectLoaderOptions
 * @property {MatchObject} match A function to include/exclude files to be processed.
 * @property {import('../../loader/types').ReactRefreshLoaderOptions} [options] Options passed to the loader.
 */

/**
 * Injects refresh loader to all JavaScript-like and user-specified files.
 * @param {*} moduleData Module factory creation data.
 * @param {InjectLoaderOptions} injectOptions Options to alter how the loader is injected.
 * @returns {*} The injected module factory creation data.
 */
 function injectRefreshLoader(moduleData, injectOptions, resolvedLoader) {
  const { match, options } = injectOptions;
  if (
    match(moduleData) &&
    // Exclude files referenced as assets
    !moduleData.type.includes('asset') &&
    // Check to prevent double injection
    !moduleData.loaders.find(({ loader }) => loader === resolvedLoader)
  ) {
    // As we inject runtime code for each module,
    // it is important to run the injected loader after everything.
    // This way we can ensure that all code-processing have been done,
    // and we won't risk breaking tools like Flow or ESLint.
    moduleData.loaders.unshift({
      loader: resolvedLoader,
      options,
    });
  }

  return moduleData;
}

module.exports.getUsedWpmPackages = function getUsedWpmPackages (source) {
  const wpmPackagesPattern = /\_\_wpm\_\_importWpmLoader\_\_wpmPackagesTag([.\s\S]+?)\_\_wpm\_\_importWpmLoader\_\_wpmPackagesTag/g
  let used = []
  let currentUsed
  while (currentUsed = wpmPackagesPattern.exec(source)) {
    used = used.concat(currentUsed[1].split(" "))
  }
  return [...new Set(used)]
}


module.exports.getNpmPkgName = async function getNpmPkgName (resourcePath) {
  if (!(/[\\/]+node_modules[\\/]+/.test(resourcePath))) {
    return ""
  }
  return pkgDir(resourcePath).then(res => {
    const npmPkgName = require(path.join(res, "package.json")).name
    return npmPkgName
  }).catch(e => {
    return ""
  })
}

module.exports.getWpmPkgName = function getWpmPkgName (npmPkgName, alias) {
  if (alias[npmPkgName + "$"]) {
    return alias[npmPkgName + "$"].replace(/^wpmjs[\\/]+\$[\\/]+/, "")
  }
  return ""
}

module.exports.injectRefreshLoader = injectRefreshLoader;
