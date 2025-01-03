import { isValidEntry } from "../utils/helpers.mjs"

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

const getStoreMap = () => {
  return structuredClone(storeMap)
}

const setStoreMap = (newMap) => {
  if (!newMap instanceof Map) {
    throw new Error(
      "Provided argument must be a Map object or key-value entries"
    )
  }

  storeMap.clear()
  storeMap.set(newMap)
}

const flushall = () => {
  storeMap.clear()
}

const store = {
  get,
  set,
  del,
  has,
  getStoreMap,
  setStoreMap,
  flushall,
}

export default store
