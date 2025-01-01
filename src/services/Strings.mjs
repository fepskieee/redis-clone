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
  static ERR_MSG_SYNTAX_ERROR = "-ERR syntax error\r\n"
  static ERR_MSG_GET_WRONG_NUMBER_ARGS =
    "-ERR Wrong number of arguments for 'GET' command\r\n"
  static ERR_MSG_SET_WRONG_NUMBER_ARGS =
    "-ERR Wrong number of arguments for 'SET' command\r\n"
  static ERR_MSG_MGET_WRONG_NUMBER_ARGS =
    "-ERR Wrong number of arguments for 'MGET' command\r\n"
  static ERR_MSG_VALUE_NOT_INTEGER =
    "-ERR value is not an integer or out of range\r\n"
  static ERR_MSG_INCRBY_WRONG_NUMBER_ARGS =
    "-ERR Wrong number of arguments for 'INCRBY' command\r\n"
  static WRONGTYPE_MSG_OEPRATION =
    "-WRONGTYPE Operation against a key holding string value\r\n"
  static ERR_MSG_KEY_EXISTS = "-ERR Key already exists\r\n"
  static ERR_MSG_NOT_STRING = "-ERR Value is not a string\r\n"
  static ERR_MSG_EXCEED_512MB = "-ERR Exceeds memory limit of 512MB\r\n"

  static GET([key], category) {
    if (arguments[0].length > 1) {
      stringsLogger.error(Strings.ERR_MSG_SYNTAX_ERROR)
      return Strings.ERR_MSG_SYNTAX_ERROR
    }

    if (!key) {
      stringsLogger.error(Strings.ERR_MSG_GET_WRONG_NUMBER_ARGS)
      return Strings.ERR_MSG_GET_WRONG_NUMBER_ARGS
    }

    if (!store.has(key)) {
      stringsLogger.info(Strings.MSG_EMPTY)
      return Strings.MSG_EMPTY
    }

    if (store.get(key).type !== category) {
      stringsLogger.error(Strings.WRONGTYPE_MSG_OEPRATION)
      return Strings.WRONGTYPE_MSG_OEPRATION
    }

    const result = store.get(key).value

    return `$${result.length}\r\n${result}\r\n`
  }

  static SET([key, value, option, time], category) {
    if (arguments[0].length % 2 !== 0) {
      stringsLogger.error(Strings.ERR_MSG_SYNTAX_ERROR)
      return Strings.ERR_MSG_SYNTAX_ERROR
    }

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
    if (arguments[0].length > 2) {
      stringsLogger.error(Strings.ERR_MSG_SYNTAX_ERROR)
      return Strings.ERR_MSG_SYNTAX_ERROR
    }

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

  static INCR([key], category) {
    if (arguments[0].length > 1) {
      stringsLogger.error(Strings.ERR_MSG_SYNTAX_ERROR)
      return Strings.ERR_MSG_SYNTAX_ERROR
    }

    if (!key) {
      stringsLogger.error(Strings.ERR_MSG_GET_WRONG_NUMBER_ARGS)
      return Strings.ERR_MSG_GET_WRONG_NUMBER_ARGS
    }

    if (!store.has(key)) {
      store.set(key, { type: category, value: "0" })
    }

    if (store.get(key).type !== category) {
      stringsLogger.error(Strings.WRONGTYPE_MSG_OEPRATION)
      return Strings.WRONGTYPE_MSG_OEPRATION
    }

    let value = Number(store.get(key).value)

    if (!Number.isInteger(value)) {
      stringsLogger.error(Strings.ERR_MSG_VALUE_NOT_INTEGER)
      return Strings.ERR_MSG_VALUE_NOT_INTEGER
    }

    value = value + 1
    store.set(key, { ...store.get(key), value: value.toString() })

    return `:${value}\r\n`
  }

  static INCRBY([key, increment], category) {
    if (arguments[0].length > 2) {
      stringsLogger.error(Strings.ERR_MSG_SYNTAX_ERROR)
      return Strings.ERR_MSG_SYNTAX_ERROR
    }

    if (!key || !increment) {
      stringsLogger.error(Strings.ERR_MSG_INCRBY_WRONG_NUMBER_ARGS)
      return Strings.ERR_MSG_INCRBY_WRONG_NUMBER_ARGS
    }

    if (!Number.isInteger(Number(increment))) {
      stringsLogger.error(Strings.ERR_MSG_VALUE_NOT_INTEGER)
      return Strings.ERR_MSG_VALUE_NOT_INTEGER
    }

    if (!store.has(key)) {
      store.set(key, { type: category, value: "0" })
    }

    let value = parseInt(store.get(key).value)

    if (!Number.isInteger(value)) {
      stringsLogger.error(Strings.ERR_MSG_VALUE_NOT_INTEGER)
      return Strings.ERR_MSG_VALUE_NOT_INTEGER
    }

    value = parseInt(value) + parseInt(increment)
    store.set(key, { ...store.get(key), value: value.toString() })

    return `:${value}\r\n`
  }

  static INCRBYFLOAT([key, increment], category) {
    if (arguments[0].length > 2) {
      stringsLogger.error(Strings.ERR_MSG_SYNTAX_ERROR)
      return Strings.ERR_MSG_SYNTAX_ERROR
    }

    if (!key || !increment) {
      stringsLogger.error(Strings.ERR_MSG_INCRBY_WRONG_NUMBER_ARGS)
      return Strings.ERR_MSG_INCRBY_WRONG_NUMBER_ARGS
    }

    if (!Number.isInteger(Number(increment))) {
      stringsLogger.error(Strings.ERR_MSG_VALUE_NOT_INTEGER)
      return Strings.ERR_MSG_VALUE_NOT_INTEGER
    }

    if (!store.has(key)) {
      store.set(key, { type: category, value: "0" })
    }

    let value = parseFloat(store.get(key).value)

    if (!Number.isInteger(value)) {
      stringsLogger.error(Strings.ERR_MSG_VALUE_NOT_INTEGER)
      return Strings.ERR_MSG_VALUE_NOT_INTEGER
    }

    value = parseFloat(value) + parseFloat(increment)
    store.set(key, { ...store.get(key), value: value.toString() })

    return `:${value}\r\n`
  }
}

export default Strings
