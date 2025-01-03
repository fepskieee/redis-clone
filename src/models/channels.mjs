const channelsMap = new Map()

const get = (key) => {
  return channelsMap.get(key)
}

const set = (key, value) => {
  return channelsMap.set(key, value)
}

const del = (key) => {
  return channelsMap.delete(key)
}

const has = (key) => {
  return channelsMap.has(key)
}

const getChannelsMap = () => {
  return structuredClone(channelsMap)
}

const setChannelsMap = (newMap) => {
  if (!newMap instanceof Map) {
    throw new Error(
      "Provided argument must be a Map object or key-value entries"
    )
  }

  channelsMap.clear()
  newMap.forEach((value, key) => {
    channelsMap.set(key, value)
  })
}

const flushall = () => {
  channelsMap.clear()
}

const channels = {
  get,
  set,
  del,
  has,
  getChannelsMap,
  setChannelsMap,
  flushall,
}

export default channels
