import { logger } from "../configs/logger.mjs"
import { storeMap } from "../models/dataStore.mjs"
import { _pathExists, _setValueAtPath } from "../utils/json-helpers.mjs"
import nesp from "../utils/nesp.js"

const jsonLogger = logger("json")

const set = ([key, path = "$", value, options = {}]) => {
  const { NX, XX } = options
  const isRoot = path === "$"

  if (!storeMap.has(key)) {
    if (XX) return nesp.bulkString()
    if (!isRoot) {
      throw new Error("Path must be root ($) for new keys")
    }

    storeMap.set(key, value)
    return nesp.simpleString("OK")
  }

  const existingValue = JSON.parse(storeMap.get(key))

  if (path !== "$" && typeof existingValue !== "object") {
    throw new Error(`Path is invalid for existing string value`)
  }

  if (NX && !_pathExists(JSON.parse(existingValue), path)) {
    return nesp.simpleString()
  }

  if (XX && !_pathExists(JSON.parse(existingValue), path)) {
    return nesp.simpleString()
  }

  const updatedValue = _setValueAtPath(existingValue, path, JSON.parse(value))
  storeMap.set(key, updatedValue)

  return nesp.simpleString("OK")
}

const get = () => {
  console.table(storeMap)
  return nesp.simpleString("OK")
}

const type = () => {
  console.log("json set")
  return nesp.simpleString("OK")
}

const json = {
  "JSON.SET": set,
  "JSON.GET": get,
  "JSON.TYPE": type,
}

export default json
