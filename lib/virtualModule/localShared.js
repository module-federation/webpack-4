const path = require("path")
const packageDirectorySync = require("pkg-dir").sync

module.exports.modulePath = path.join(process.cwd(), "$_mfplugin_virtualLocalShared/index.js")

module.exports.getSharedModule = function (pluginInstance) {
  const {options} = pluginInstance
  return `
  /* eslint-disable */
  ${Object.keys(options.shared).map(key => {
    let config = options.shared[key]
    if (typeof config === "string") {
      config = {
        from: options.name,
        requiredVersion: "",
        shareScope: options.shareScope || "default",
        singleton: false,
        version: config,
        loaded: false,
        eager: false,
        strictVersion: false,
      }
    }
    return `
      module.exports["${key}"] = {
        // import,
        eager: ${config.eager || false},
        from: "${config.from || options.name}",
        requiredVersion: "${config.requiredVersion || "*"}",
        shareScope: "${config.shareScope || "default"}",
        singleton: ${config.singleton || false},
        version: "${config.version || require(path.join(packageDirectorySync(require.resolve(key)), "package.json")).version}",
        loaded: ${config.eager ? 1 : false},
        async get () {
          module.exports["${key}"].loaded = 1
          ${
            typeof version === 'object' && version.eager ?
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