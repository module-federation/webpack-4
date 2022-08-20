const { idConfigMap, urlIdMap } = window.System.__wpmjs__

const existingHook = System.constructor.prototype.getRegister;
System.constructor.prototype.getRegister = function (url) {
  return Promise.resolve(existingHook.call(this, url))
  .then(function ([deps, oriDecFun] = []) {
    const addDeps = idConfigMap[urlIdMap[url]]?.deps || []
    return [[...deps, ...addDeps], oriDecFun]
  });
};
