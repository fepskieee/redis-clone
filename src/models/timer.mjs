const timerMap = new Map()

const get = (key) => {
  return timerMap.get(key)
}

const set = (key, values) => {
  return timerMap.set(key, values)
}

const del = (key) => {
  return timerMap.delete(key)
}

const has = (key) => {
  return timerMap.has(key)
}

const getTimerMap = () => {
  return structuredClone(timerMap)
}

const setTimerMap = (newMap) => {
  if (!newMap instanceof Map || isValidEntry(newMap)) {
    throw new Error(
      "Provided argument must be a Map object or key-value entries"
    )
  }

  timerMap.clear()
  timerMap.set(newMap)
}

const flushall = () => {
  timerMap.clear()
}

const timer = {
  get,
  set,
  del,
  has,
  getTimerMap,
  setTimerMap,
  flushall,
}

export default timer
