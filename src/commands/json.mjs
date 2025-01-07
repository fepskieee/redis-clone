import { logger } from "../configs/logger.mjs"
import { storeMap } from "../models/dataStore.mjs"
import {
  _getValueAtPath,
  _pathExists,
  _setValueAtPath,
} from "../utils/json-helpers.mjs"
import nesp from "../utils/nesp.js"

const jsonLogger = logger("json")

const set = ([key, path = "$", value, option]) => {
  const isRoot = path === "$"

  if (!storeMap.has(key)) {
    if (option) return nesp.bulkString()
    if (!isRoot) {
      throw new Error("Path must be root ($) for new keys")
    }

    storeMap.set(key, value)
    return nesp.simpleString("OK")
  }

  const existingValue = JSON.parse(storeMap.get(key))

  if (
    !isRoot &&
    typeof existingValue === "object" &&
    !_pathExists(path, existingValue)
  ) {
    throw new Error(`Path is invalid for the existing value`)
  }

  if (option && !_pathExists(path, existingValue)) {
    return nesp.simpleString()
  }

  if (option && !_pathExists(path, existingValue)) {
    return nesp.simpleString()
  }

  const updatedValue = _setValueAtPath(existingValue, path, JSON.parse(value))
  storeMap.set(key, JSON.stringify(updatedValue))

  return nesp.simpleString("OK")
}

const get = ([key, ...paths], type) => {
  if (!key) {
    return nesp.simpleError(
      `ERR wrong number of arguments for JSON.GET command`
    )
  }

  if (type !== "json") {
    return nesp.simpleError(
      "WRONGTYPE Operation against a key holding the wrong kind of value"
    )
  }

  const isRoot = paths[0] === "$"

  if (!storeMap.has(key)) return nesp.bulkString()
  if (isRoot) return nesp.bulkString(storeMap.get(key))

  const parseJson = JSON.parse(storeMap.get(key))

  try {
    const value = _getValueAtPath(parseJson, paths)
    return nesp.bulkString(JSON.stringify(value))
  } catch (error) {
    throw new Error(error.message)
  }
}

const type = () => {
  console.log("json set")
  return nesp.simpleString("OK")
}

const existingValue = {
  "JSON.SET": set,
  "JSON.GET": get,
  "JSON.TYPE": type,
}

export default existingValue
