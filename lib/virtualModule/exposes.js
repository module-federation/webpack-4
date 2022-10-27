const path = require("path")
const {modulePath: virtualSetSharedPath} = require("./setShared")
const {modulePath: virtualInitConfigPath} = require("./initConfig")

// initcontainer 选择使用哪个依赖
// 先single 再 version 再strict required
// wpmjs缓存入口的父级包

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
          return import("../${url}")
        }\r\n
      `
    })}
  }
  module.exports = window["${options.name}"] = {
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