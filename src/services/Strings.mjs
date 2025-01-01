import { logger } from "../configs/logger.mjs"
import store from "../models/store.mjs"
import timer from "../models/timer.mjs"
import { getCurrentFilename } from "../utils/helpers.mjs"

const namespace = getCurrentFilename(import.meta.url)
const stringsLogger = logger(namespace)

class Strings {
  static MAX_MEMORY = 512 * 1024 * 1024
  static MSG_SUCCESS = "+OK\r\n"
  static MSG_EMPTY = "$-1\r\n"
  static ERR_MSG_GET_WRONG_NUMBER_ARGS =
    "-ERR Wrong number of arguments for 'GET' command\r\n"
  static ERR_MSG_SET_WRONG_NUMBER_ARGS =
    "-ERR Wrong number of arguments for 'SET' command\r\n"
  static ERR_MSG_MGET_WRONG_NUMBER_ARGS =
    "-ERR Wrong number of arguments for 'MGET' command\r\n"
  static ERR_MSG_WRONG_TYPE_OEPRATION =
    "-WRONGTYPE Operation against a key holding string value\r\n"
  static ERR_MSG_KEY_EXISTS = "-ERR Key already exists\r\n"
  static ERR_MSG_NOT_STRING = "-ERR Value is not a string\r\n"
  static ERR_MSG_EXCEED_512MB = "-ERR Exceeds memory limit of 512MB\r\n"

  static GET([key], category) {
    if (!key) {
      stringsLogger.error(Strings.ERR_MSG_GET_WRONG_NUMBER_ARGS)
      return Strings.ERR_MSG_GET_WRONG_NUMBER_ARGS
    }

    if (!store.has(key)) {
      stringsLogger.error(Strings.MSG_EMPTY)
      return Strings.MSG_EMPTY
    }

    if (store.get(key).type !== category) {
      stringsLogger.error(Strings.ERR_MSG_WRONG_TYPE_OEPRATION)
      return Strings.ERR_MSG_WRONG_TYPE_OEPRATION
    }

    const result = store.get(key).value

    return `$${result.length}\r\n${result}\r\n`
  }

  static SET([key, value, time], category) {
    if (!key || !value) {
      stringsLogger.error(Strings.ERR_MSG_SET_WRONG_NUMBER_ARGS)
      return Strings.ERR_MSG_SET_WRONG_NUMBER_ARGS
    }

    if (typeof value !== "string") {
      stringsLogger.error(Strings.ERR_MSG_NOT_STRING)
      return Strings.ERR_MSG_NOT_STRING
    }
    const byteLength = Buffer.byteLength(value, "utf8")

    if (byteLength > Strings.MAX_MEMORY) {
      stringsLogger.error(Strings.ERR_MSG_EXCEED_512MB)
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
      stringsLogger.error(Strings.ERR_MSG_KEY_EXISTS)
      return Strings.ERR_MSG_KEY_EXISTS
    }

    return Strings.SET([key, value], category)
  }

  static MGET(keys, category) {
    if (!keys || keys.length < 1) {
      stringsLogger.error(Strings.ERR_MSG_MGET_WRONG_NUMBER_ARGS)
      return `${Strings.ERR_MSG_MGET_WRONG_NUMBER_ARGS}`
    }

    const result = keys
      .map((key) => {
        if (!store.has(key)) return Strings.MSG_EMPTY
        if (store.get(key).type !== category) return Strings.MSG_EMPTY

        const result = store.get(key).value

        return `$${result.length}\r\n${result}\r\n`
      })
      .reduce((acc, curr) => acc + `${curr}`, `*${keys.length}\r\n`)

    return result
  }
}

export default Strings
