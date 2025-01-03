import subscribersMap from "./subscribers.mjs"

const channels = new Map()

const get = (key) => {
  return channels.get(key)
}

const set = (key, value) => {
  return channels.set(key, value)
}

const del = (key) => {
  return channels.delete(key)
}

const has = (key) => {
  return channels.has(key)
}

const getChannelsMap = () => {
  return structuredClone(channels)
}

const setChannelsMap = (newMap) => {
  if (!newMap instanceof Map) {
    throw new Error(
      "Provided argument must be a Map object or key-value entries"
    )
  }

  channels.clear()
  newMap.forEach((value, key) => {
    channels.set(key, value)
  })
}

const flushall = () => {
  channels.clear()
}

const store = {
  get,
  set,
  del,
  has,
  getChannelsMap,
  setChannelsMap,
  flushall,
}

export default subscribersMap
