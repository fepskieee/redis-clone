import { logger } from "../configs/logger.mjs"
import store from "../models/store.mjs"
import timer from "../models/timer.mjs"
import { getCurrentFilename } from "../utils/helpers.mjs"

const namespace = getCurrentFilename(import.meta.url)
const stringsLogger = logger(namespace)

class Strings {
  static MAX_MEMORY = 512 * 1024 * 1024
  static MSG_SUCCESS = "+OK\r\n"
  static MSG_EMPTY = "+(nil)\r\n"
  static ERR_MSG_GET_WRONG_NUMBER_ARGS =
    "-ERR Wrong number of arguments for 'GET' command\r\n"
  static ERR_MSG_SET_WRONG_NUMBER_ARGS =
    "-ERR Wrong number of arguments for 'SET' command\r\n"
  static ERR_MSG_MGET_WRONG_NUMBER_ARGS =
    "-ERR Wrong number of arguments for 'MGET' command\r\n"
  static ERR_MSG_WRONG_TYPE_OEPRATION =
    "-ERR WRONG type operation for keys with non-string values\r\n"
  static ERR_MSG_KEY_EXISTS = "-ERR Key already exists\r\n"
  static ERR_MSG_NOT_STRING = "-ERR Value is not a string\r\n"
  static ERR_MSG_EXCEED_512MB = "-ERR Exceeds memory limit of 512MB\r\n"

  static GET([key], category) {
    if (!key) return Strings.ERR_MSG_GET_WRONG_NUMBER_ARGS

    if (!store.has(key)) return Strings.MSG_EMPTY

    if (store.get(key).type !== category) {
      return Strings.ERR_MSG_WRONG_TYPE_OEPRATION
    }

    return `+${store.get(key).value}\r\n`
  }

  static SET([key, value, time], category) {
    if (!key || !value) {
      return Strings.ERR_MSG_SET_WRONG_NUMBER_ARGS
    }

    if (typeof value !== "string") {
      return Strings.ERR_MSG_NOT_STRING
    }
    const byteLength = Buffer.byteLength(value, "utf8")

    if (byteLength > Strings.MAX_MEMORY) {
      return Strings.ERR_MSG_EXCEED_512MB
    }

    store.set(key, { type: category, value })

    if (timer.has(key) && timer.get(key).timeoutId) {
      clearTimeout(timer.get(key).timeoutId)
      clearInterval(timer.get(key).intervalId)
      timer.del(key)
    }

    let timeoutId = null
    let intervalId = null
    let remainingTime = null

    const duration = Number(time)
    const ttl = duration && duration > 0 ? duration : 0

    if (Number.isInteger(ttl) && ttl > 0) {
      let startTime = Date.now()

      intervalId = setInterval(() => {
        const elapsedTime = Date.now() - startTime
        remainingTime = Math.max(ttl - elapsedTime, 0) / 1000
        remainingTime = Math.round(remainingTime)

        if (timer.has(key)) {
          timer.get(key).remainingTime = remainingTime
        }
      }, 1000)

      timeoutId = setTimeout(() => {
        clearTimeout(timer.get(key).timeoutId)
        clearInterval(timer.get(key).intervalId)
        store.del(key)
        timer.del(key)
      }, ttl)

      timer.set(key, {
        timeoutId,
        intervalId,
      })
    }

    return Strings.MSG_SUCCESS
  }

  static SETNX([key, value], category) {
    if (store.has(key)) {
      return Strings.ERR_MSG_KEY_EXISTS
    }

    return Strings.SET([key, value], category)
  }

  static MGET(keys, category) {
    if (!keys || keys.length < 1) {
      stringsLogger.error(Strings.ERR_MSG_MGET_WRONG_NUMBER_ARGS)
      return `${Strings.ERR_MSG_MGET_WRONG_NUMBER_ARGS}`
    }

    const result = keys.map((key) => {
      if (!store.has(key)) return "(nil)"
      if (store.get(key).type !== category) return "(nil)"
      return store.get(key).value
    })

    console.table(result)

    stringsLogger.info(Strings.MSG_SUCCESS)
    return Strings.MSG_SUCCESS
  }
}

export default Strings
