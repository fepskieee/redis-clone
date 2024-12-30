const storeMap = new Map()

export const get = (key) => {
  return storeMap.get(key)
}

export const set = (key, values) => {
  return storeMap.set(key, values)
}

export const del = (key) => {
  return storeMap.delete(key)
}

export const keys = () => {
  return structuredClone(storeMap)
}

const store = {
  get,
  set,
  del,
  keys,
}

export default store
