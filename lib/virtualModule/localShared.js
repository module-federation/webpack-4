const path = require("path")

module.exports.modulePath = path.join(process.cwd(), "$_mfplugin_virtualLocalShared/index.js")

module.exports.getSharedModule = function (pluginInstance) {
  const {options} = pluginInstance
  return `
  /* eslint-disable */
  ${Object.keys(options.shared).map(key => {
    let config = options.shared[key]
    return `
      module.exports["${key}"] = {
        import: "${config.import}",
        eager: ${config.eager},
        from: "${config.from || options.name}",
        requiredVersion: "${config.requiredVersion}",
        shareScope: "${config.shareScope}",
        singleton: ${config.singleton},
        version: "${config.version}",
        loaded: ${config.eager ? 1 : false},
        async get () {
          module.exports["${key}"].loaded = 1
          ${
            config.eager ?
            `const pkg = require("${config.import}${config.import.indexOf("?") > -1 ? "&" : "?"}isLocalShareEntry=1")` : 
            `const pkg = await import("${config.import}${config.import.indexOf("?") > -1 ? "&" : "?"}isLocalShareEntry=1" /* webpackChunkName: 'vendors-node_modules_${key}' */)`
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