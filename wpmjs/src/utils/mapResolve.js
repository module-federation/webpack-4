import resolveRequest from "./resolveRequest"

const {
  idUrlMap,
  urlIdMap,
  idDefineMap,
} = window.System.__wpmjs__

export function getConfig(id, request) {
  if (/^https?:\/\//.test(id)) {
    return idUrlMap[id]
  }
  // request = request || resolveRequest(id)
  // const {name, version, entry} = request
  // let config = idUrlMap[id] || 
  //   idUrlMap[`${name}@${version}${entry ? `/${entry}` : ""}`] || 
  //   idUrlMap[`${name}@${version}`] ||
  //   idUrlMap[`${name}`]
  return config
}

export function getIdByUrl(url = "") {
  if (!url) return
  url = url.split("?")[0]
  return urlIdMap[url]
}

/**
 * 检查id作为依赖的url
 * @param {*} id 
 * @param {*} parentUrl 
 */
export function getDepUrl(id, parentUrl = "") {
  const config = idDefineMap[getIdByUrl(parentUrl)]
  if (!config) return
  return config?.deps
    .filter(item => {
      if (item === id || item.name === id) {
        return true
      }
    })
    .map(item => getPkgUrl(typeof item === "string" ? item : item.target))
    ?.[0]
}

/**
 * 获取当前请求的包的url
 * 当前包可能是一个依赖, 比如react-dom的deps ["react"], 所以要先用parentUrl, 再用id
 * @param {*} id 
 * @param {*} parentUrl 
 * @returns 
 */
export function getPkgUrl(id) {
  if (/^https?:\/\//.test(id)) {
    return id
  }
  const request = resolveRequest(id)
  // let config = getConfig(id, request)
  let mapUrl = idUrlMap[id]
  if (/^https?:\/\//.test(mapUrl)) {
    return mapUrl
  }
  const mapRequest = mapUrl ? resolveRequest(mapUrl) : request
  const targetRequest = {
    name: mapRequest.name || request.name,
    version: mapRequest.version || request.version,
    entry: mapRequest.entry || request.entry,
    query: mapRequest.query || request.query,
    env: window.System.__wpmjs__.env
  }
  return window.System.__wpmjs__.resolvePath(targetRequest) + 
    window.System.__wpmjs__.resolveEntryFile(targetRequest) +
    window.System.__wpmjs__.resolveQuery(targetRequest)
}

const existingHook = System.constructor.prototype.resolve;
System.constructor.prototype.resolve = function (...args) {
  const [id, parentUrl] = args
  const url = getDepUrl(id, parentUrl) || getPkgUrl(id)
  const doUrl = url || existingHook.call(this, ...args);
  return doUrl
};
