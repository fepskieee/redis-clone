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
  if (!newMap instanceof Map) {
    throw new Error(
      "Provided argument must be a Map object or key-value entries"
    )
  }

  timerMap.clear()
  newMap.forEach((value, key) => {
    timerMap.set(key, value)
  })
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
