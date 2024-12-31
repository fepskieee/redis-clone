const storeMap = new Map()

const get = (key) => {
  return storeMap.get(key)
}

const set = (key, value) => {
  return storeMap.set(key, value)
}

const del = (key) => {
  return storeMap.delete(key)
}

const has = (key) => {
  return storeMap.has(key)
}

const keys = () => {
  return structuredClone(storeMap)
}

const flushall = () => {
  storeMap.clear()
}

const store = {
  get,
  set,
  del,
  has,
  keys,
  flushall,
}

export default store
