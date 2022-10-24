module.exports = function addEntry(oriEntry, addEntry = {name: "", path: ""}) {
  if (typeof oriEntry === "string" || oriEntry instanceof Array) {
    return {
      main: oriEntry,
      [addEntry.name]: addEntry.path
    }
  } else if (typeof oriEntry === "object") {
    return {
      ...oriEntry,
      [addEntry.name]: addEntry.path
    }
  } else if (typeof oriEntry === "function") {
    return () => Promise.resolve(oriEntry()).then(oriEntry => addEntry(oriEntry))
  }
}