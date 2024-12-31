const timerMap = new Map()

export const get = (key) => {
  return timerMap.get(key)
}

export const set = (key, values) => {
  return timerMap.set(key, values)
}

export const del = (key) => {
  return timerMap.delete(key)
}

export const has = (key) => {
  return timerMap.has(key)
}

export const keys = () => {
  return structuredClone(timerMap)
}

export const flushall = () => {
  timerMap.clear()
}

const timer = {
  get,
  set,
  del,
  has,
  keys,
  flushall,
}

export default timer
