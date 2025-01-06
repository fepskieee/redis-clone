import { logger } from "../configs/logger.mjs"
import { storeMap } from "../models/dataStore.mjs"
import nesp from "../utils/nesp.js"

const jsonLogger = logger("json")

const set = (key, path = "$", value, options = {}) => {
  // const { NX, XX } = options
  console.log("json set")

  const isRoot = path === "$"

  if (!storeMap.has(key)) {
    if (XX) return nesp.bulkString()
    // if (isRoot) {
    //   throw new Error("Path must be root ($) for new keys")
    // }

    storeMap.set(key, { value })
    return nesp.simpleString("OK")
  }

  const existingValue = storeMap.get(key).value
  if (typeof existingValue !== "object") {
    throw new Error("Existing key is not a valid JSON object")
  }

  if (NX && !_pathExists(existingValue, path)) {
    return nesp.simpleString()
  }

  if (XX && !_pathExists(existingValue, path)) {
    return nesp.simpleString()
  }

  function _pathExists(json, path) {
    try {
      const result = parse(path, json) // TODO:
      return result.length > 0
    } catch (error) {
      return false
    }
  }

  // TODO:
  const keys = path.split(".").filter(Boolean)
  let currentLevel = storeMap
  keys.forEach(key, (index) => {
    if (!storeMap.has(key)) {
      currentLevel.set(key, index === keys.length - 1 ? value : new Map())
    }
    current = current.get(key)
  })

  return nesp.simpleString("OK")
}

const get = () => {
  console.log("json set")
  return nesp.simpleString("OK")
}

const type = () => {
  console.log("json set")
  return nesp.simpleString("OK")
}

const json = {
  SET: set,
}

export default json
