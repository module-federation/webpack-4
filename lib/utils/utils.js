const path = require("path")
const webpack = require("webpack")
const fs = require("fs")

/**
 * 获取依赖的路径
 * @param {*} dep 
 * @param {*} context 
 */
 module.exports.getEntrysPath = function(dep, context, extensions = []) {
  if (dep.request) {
    // 绝对路径直接返回, 相对路径拼上context
    const request = /^(.:|\/)/.test(dep.request) ? dep.request : path.join(context, dep.request)
    for (var extension of [""].concat(extensions)) {
      if (fs.existsSync(request + extension)) {
        return [request + extension]
      }
    }
    return [request]
  }
  return dep.dependencies
    .filter(dep => dep.constructor.name.indexOf("EntryDependency") > -1)
    .map(dep => module.exports.getEntrysPath(dep, context, extensions)[0])
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

module.exports.injectRefreshLoader = injectRefreshLoader;

const cacheUtilMap = {}
module.exports.cacheUtil = function (scope, key, getCacheObject) {
  cacheUtilMap[scope] = cacheUtilMap[scope] || {}
  return cacheUtilMap[scope][key] = cacheUtilMap[scope][key] || getCacheObject()
}