const storeMap = new Map()

export const get = (key) => {
  return storeMap.has(key) ? storeMap.get(key) : 0
}

export const set = (key, values) => {
  return storeMap.set(key, values)
}

export const del = (key) => {
  if (!storeMap.has(key)) return 0

  storeMap.delete(key)
  return 1
}

export const exists = (key) => {
  return storeMap.has(key) ? 1 : 0
}

export const keys = () => {
  return structuredClone(storeMap)
}

export const flushall = () => {
  storeMap.clear()
}
