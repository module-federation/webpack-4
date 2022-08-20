const {
  idConfigMap,
  urlIdMap,
  idModuleMap
} = window.System.__wpmjs__

const existingHook = System.constructor.prototype.resolve;
System.constructor.prototype.resolve = function (...args) {
  const [id, parentUrl] = args
  const config = idConfigMap[id]
  let url = config && (typeof config === "string" ? config : config.url)
  const doUrl = url || existingHook.call(this, ...args);
  urlIdMap[doUrl] = id
  return doUrl
};



// const resolve = System.constructor.prototype.resolve
// Object.defineProperty(System.constructor.prototype, "resolve", {
//   set(newResolve) {
    
//   },
//   get() {

//   }
// })
// const existingHook1 = System.constructor.prototype.createScript;

// System.constructor.prototype.createScript = function (url) {
//   console.log(444445, url)
//   return Promise.resolve(existingHook1.call(this, url))
//     .then(function (res) {
//       window.System.set(id, res)
//       return res
//     })
// }

// const existingHook2 = System.constructor.prototype.fetch;

// System.constructor.prototype.fetch = function (url) {
//   console.log(444445, url)
//   return Promise.resolve(existingHook2.call(this, url))
//     .then(function (res) {
//       window.System.set(id, res)
//       return res
//     })
// }