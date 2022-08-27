import resolveRequest from "./resolveRequest"

const {
  idConfigMap,
  urlIdMap,
} = window.System.__wpmjs__

export function getConfig(id, request) {
  if (/^https?:\/\//.test(id)) {
    return idConfigMap[id]
  }
  request = request || resolveRequest(id)
  const {name, version, entry} = request
  let config = idConfigMap[id] || 
    idConfigMap[`${name}@${version}${entry ? `/${entry}` : ""}`] || 
    idConfigMap[`${name}@${version}`] ||
    idConfigMap[`${name}`]
  return config
}

export function getUrl(id) {
  if (/^https?:\/\//.test(id)) {
    return id
  }
  const request = resolveRequest(id)
  let config = getConfig(id, request)
  if (typeof config === "string") {
    config = {
      url: config
    }
  }
  if (/^https?:\/\//.test(config?.url)) {
    return config.url
  }
  const mapRequest = config ? resolveRequest(config.url) : request
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
  const url = getUrl(id)
  const doUrl = url || existingHook.call(this, ...args);
  urlIdMap[doUrl] = id
  return doUrl
};
