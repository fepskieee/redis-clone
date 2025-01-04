import { logger } from "../configs/logger.mjs"
import { storeMap } from "../models/dataStore.mjs"
import {
  ERR_MSG_SYNTAX_ERROR,
  ERR_MSG_WRONG_NUMBER_ARGS,
  ERR_MSG_WRONGTYPE_OPERATION,
} from "../utils/constants/messages.js"
import nesp from "../utils/nesp.js"

const stringsLogger = logger("strings")

export const get = (key) => {
  if (!key) {
    return nesp.simpleError(ERR_MSG_WRONG_NUMBER_ARGS)
  }

  if (!storeMap.has(key)) {
    return nesp.bulkString()
  }

  if (store.get(key).type !== "strings") {
    stringsLogger.error(ERR_MSG_WRONGTYPE_OPERATION)
    return nesp.WRONGTYPE_MSG_OEPRATION
  }

  const value = store.get(key).value

  return nesp.bulkString(value)
}

export const set = (key, value, options = {}) => {}
export const mget = (keys) => {}
export const incr = (key) => {}
export const incrby = (key, increment) => {}
export const incrbyfloat = (key, increment) => {}

const strings = {
  get,
  set,
  incr,
  incrby,
  incrbyfloat,
}

export default strings
