const subscribersMap = new Map()

const get = (key) => {
  return subscribersMap.get(key)
}

const set = (key, value) => {
  return subscribersMap.set(key, value)
}

const del = (key) => {
  return subscribersMap.delete(key)
}

const has = (key) => {
  return subscribersMap.has(key)
}

const getSubscribersMap = () => {
  return structuredClone(subscribersMap)
}

const setSubscribersMap = (newMap) => {
  if (!newMap instanceof Map) {
    throw new Error(
      "Provided argument must be a Map object or key-value entries"
    )
  }

  subscribersMap.clear()
  newMap.forEach((value, key) => {
    subscribersMap.set(key, value)
  })
}

const flushall = () => {
  subscribersMap.clear()
}

const store = {
  get,
  set,
  del,
  has,
  getSubscribersMap,
  setSubscribersMap,
  flushall,
}

export default store
