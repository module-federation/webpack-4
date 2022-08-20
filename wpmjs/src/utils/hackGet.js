const { idModuleMap } = window.System.__wpmjs__;

const existingHook = System.constructor.prototype.import;
System.constructor.prototype.import = function (id, parentUrl) {
  return Promise.resolve(existingHook.call(this, id, parentUrl))
    .then(function (res) {
      idModuleMap[id] = res
      return res
    })
}