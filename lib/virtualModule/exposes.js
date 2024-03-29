const path = require("path")
const {modulePath: virtualSetSharedPath} = require("./setShared")
const {modulePath: virtualInitConfigPath} = require("./initConfig")

module.exports.modulePath = path.join(process.cwd(), "$_mfplugin_virtualExposes/index.js")
module.exports.getExposesModule = function (pluginInstance) {
  const {options} = pluginInstance
  return `
  /* eslint-disable */
  require(${JSON.stringify(virtualInitConfigPath)})
  const {setInitShared} = require(${JSON.stringify(virtualSetSharedPath)})
  const exposes = {
    ${Object.keys(options.exposes).map(key => {
      const url = options.exposes[key]
      return `
        "${key}" () {
          return import("../${url}" /* webpackChunkName: 'vendors-exposes_${key.replace(/\.|\/|\\/g, "_")}' */)
        }\r\n
      `
    })}
  }
  module.exports = window["${options.name}"] = window["${options.name}"] || {
    async get(moduleName) {
      if (!exposes[moduleName]) {
        throw new Error(\`Uncaught Error: Module "\${moduleName}" does not exist in container.\`)
      }
      const module = await exposes[moduleName]()
      return function() {
        return module
      }
    },
    // 此处是某个scope之内的shared
    async init(shared) {
      setInitShared(shared)
      await window["__mfplugin__${options.name}"].initSharedPromise
      return 1
    }
  }
  
  `
}