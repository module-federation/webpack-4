import { getIdByUrl } from "./mapResolve";

const { idDefineMap } = window.System.__wpmjs__

const existingHook = System.constructor.prototype.getRegister;
System.constructor.prototype.getRegister = function (url) {
  return Promise.resolve(existingHook.call(this, url))
  .then(function ([deps, oriDecFun] = []) {
    const config = idDefineMap[getIdByUrl(url)]
    const addDeps = (config?.deps || []).map(item => {
      if (typeof item === "string") return item
      return item.target
    })
    return [[...deps, ...addDeps], oriDecFun]
  });
};
