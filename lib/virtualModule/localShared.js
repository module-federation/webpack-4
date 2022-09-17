const path = require("path")
const packageDirectorySync = require("pkg-dir").sync
const resolveCwd = require("resolve-cwd")

module.exports.modulePath = path.join(process.cwd(), "$_mfplugin_virtualLocalShared/index.js")

module.exports.getSharedModule = function (pluginInstance) {
  const {options} = pluginInstance
  return `
  /* eslint-disable */
  ${Object.keys(options.shared).map(key => {
    let config = options.shared[key]
    return `
      module.exports["${key}"] = {
        // import,
        eager: ${config.eager},
        from: "${config.from}",
        requiredVersion: "${config.requiredVersion}",
        shareScope: "${config.shareScope}",
        singleton: ${config.singleton},
        version: "${config.version}",
        loaded: ${config.eager},
        async get () {
          module.exports["${key}"].loaded = 1
          ${
            config.eager ?
            `const pkg = require("${key}")` : 
            `const pkg = await import("${key}" /* webpackChunkName: 'vendors-node_modules_${key}' */)`
          }
          return function () {
            return pkg
          }
        }
      }\r\n
    `
  })}
  `
}