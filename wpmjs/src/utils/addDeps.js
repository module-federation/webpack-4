import { getConfig } from "./mapResolve";

const { urlIdMap, idConfigMap } = window.System.__wpmjs__

const existingHook = System.constructor.prototype.getRegister;
System.constructor.prototype.getRegister = function (url) {
  return Promise.resolve(existingHook.call(this, url))
  .then(function ([deps, oriDecFun] = []) {
    const cacheId = urlIdMap[url]
    const addDeps = cacheId ? getConfig(cacheId)?.deps || [] : []
    return [[...deps, ...addDeps], oriDecFun]
  });
};
