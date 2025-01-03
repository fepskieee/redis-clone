import { logger } from "../configs/logger.mjs"
import store from "../models/store.mjs"
import timer from "../models/timer.mjs"
import { getCurrentFilename } from "../utils/helpers.mjs"

const namespace = getCurrentFilename(import.meta.url)
const stringsLogger = logger(namespace)

class Lists {
  static MSG_SUCCESS = "+OK\r\n"
  static MSG_EMPTY = "$-1\r\n"
  static ERR_MSG_SYNTAX_ERROR = "-ERR syntax error\r\n"
  static ERR_MSG_WRONG_NUMBER_ARGS = "-ERR wrong number of arguments\r\n"
  static ERR_MSG_NOT_LIST = "-ERR value is not a list\r\n"

  static LPUSH([key, ...values], type) {
    if (arguments[0].length < 2) {
      stringsLogger.error(Lists.ERR_MSG_WRONG_NUMBER_ARGS)
      return Lists.ERR_MSG_WRONG_NUMBER_ARGS
    }

    if (!store.has(key)) {
      store.set(key, { type, value: [] })
    }

    if (!Array.isArray(store.get(key).value)) {
      stringsLogger.error(Lists.ERR_MSG_NOT_LIST)
      return Lists.ERR_MSG_NOT_LIST
    }

    const list = store.get(key).value
    values.forEach((value) => list.unshift(value))
    store.set(key, { ...store.get(key), value: list })

    return `:${list.length}\r\n`
  }

  static RPUSH([key, ...values], type) {
    if (arguments[0].length < 2) {
      stringsLogger.error(Lists.ERR_MSG_WRONG_NUMBER_ARGS)
      return Lists.ERR_MSG_WRONG_NUMBER_ARGS
    }

    if (!store.has(key)) {
      store.set(key, { type, value: [] })
    }

    if (!Array.isArray(store.get(key).value)) {
      stringsLogger.error(Lists.ERR_MSG_NOT_LIST)
      return Lists.ERR_MSG_NOT_LIST
    }

    const list = store.get(key).value
    values.forEach((value) => list.push(value))
    store.set(key, { ...store.get(key), value: list })

    return `:${list.length}\r\n`
  }

  static LPOP([key], type) {
    if (arguments[0].length !== 1) {
      stringsLogger.error(Lists.ERR_MSG_WRONG_NUMBER_ARGS)
      return Lists.ERR_MSG_WRONG_NUMBER_ARGS
    }

    if (!store.has(key)) {
      return Lists.MSG_EMPTY
    }

    if (!Array.isArray(store.get(key).value)) {
      stringsLogger.error(Lists.ERR_MSG_NOT_LIST)
      return Lists.ERR_MSG_NOT_LIST
    }

    const list = store.get(key).value
    const value = list.shift()
    store.set(key, { ...store.get(key), value: list })

    return value ? `$${value.length}\r\n${value}\r\n` : Lists.MSG_EMPTY
  }

  static RPOP([key], type) {
    if (arguments[0].length !== 1) {
      stringsLogger.error(Lists.ERR_MSG_WRONG_NUMBER_ARGS)
      return Lists.ERR_MSG_WRONG_NUMBER_ARGS
    }

    if (!store.has(key)) {
      return Lists.MSG_EMPTY
    }

    if (!Array.isArray(store.get(key).value)) {
      stringsLogger.error(Lists.ERR_MSG_NOT_LIST)
      return Lists.ERR_MSG_NOT_LIST
    }

    const list = store.get(key).value
    const value = list.pop()
    store.set(key, { ...store.get(key), value: list })

    return value ? `$${value.length}\r\n${value}\r\n` : Lists.MSG_EMPTY
  }

  static LLEN([key], type) {
    if (arguments[0].length !== 1) {
      stringsLogger.error(Lists.ERR_MSG_WRONG_NUMBER_ARGS)
      return Lists.ERR_MSG_WRONG_NUMBER_ARGS
    }

    if (!store.has(key)) {
      return ":0\r\n"
    }

    if (!Array.isArray(store.get(key).value)) {
      stringsLogger.error(Lists.ERR_MSG_NOT_LIST)
      return Lists.ERR_MSG_NOT_LIST
    }

    const list = store.get(key).value
    return `:${list.length}\r\n`
  }

  static LRANGE([key, start, stop], type) {
    if (arguments[0].length !== 3) {
      stringsLogger.error(Lists.ERR_MSG_WRONG_NUMBER_ARGS)
      return Lists.ERR_MSG_WRONG_NUMBER_ARGS
    }

    if (!store.has(key)) {
      return Lists.MSG_EMPTY
    }

    if (!Array.isArray(store.get(key).value)) {
      stringsLogger.error(Lists.ERR_MSG_NOT_LIST)
      return Lists.ERR_MSG_NOT_LIST
    }

    const list = store.get(key).value
    const range = list.slice(parseInt(start), parseInt(stop) + 1)

    const result = range
      .map((value) => `$${value.length}\r\n${value}\r\n`)
      .reduce((acc, curr) => acc + curr, `*${range.length}\r\n`)

    return result
  }

  static LMOVE([source, destination, whereFrom, whereTo], type) {
    if (arguments[0].length !== 4) {
      stringsLogger.error(Lists.ERR_MSG_WRONG_NUMBER_ARGS)
      return Lists.ERR_MSG_WRONG_NUMBER_ARGS
    }

    if (!store.has(source)) {
      return Lists.MSG_EMPTY
    }

    if (!Array.isArray(store.get(source).value)) {
      stringsLogger.error(Lists.ERR_MSG_NOT_LIST)
      return Lists.ERR_MSG_NOT_LIST
    }

    const sourceList = store.get(source).value
    let value

    if (whereFrom === "LEFT") {
      value = sourceList.shift()
    } else if (whereFrom === "RIGHT") {
      value = sourceList.pop()
    } else {
      stringsLogger.error(Lists.ERR_MSG_SYNTAX_ERROR)
      return Lists.ERR_MSG_SYNTAX_ERROR
    }

    if (!value) {
      return Lists.MSG_EMPTY
    }

    if (!store.has(destination)) {
      store.set(destination, { type, value: [] })
    }

    if (!Array.isArray(store.get(destination).value)) {
      stringsLogger.error(Lists.ERR_MSG_NOT_LIST)
      return Lists.ERR_MSG_NOT_LIST
    }

    const destinationList = store.get(destination).value

    if (whereTo === "LEFT") {
      destinationList.unshift(value)
    } else if (whereTo === "RIGHT") {
      destinationList.push(value)
    } else {
      stringsLogger.error(Lists.ERR_MSG_SYNTAX_ERROR)
      return Lists.ERR_MSG_SYNTAX_ERROR
    }

    store.set(source, { ...store.get(source), value: sourceList })
    store.set(destination, {
      ...store.get(destination),
      value: destinationList,
    })

    return `$${value.length}\r\n${value}\r\n`
  }

  static LTRIM([key, start, stop], type) {
    if (arguments[0].length !== 3) {
      stringsLogger.error(Lists.ERR_MSG_WRONG_NUMBER_ARGS)
      return Lists.ERR_MSG_WRONG_NUMBER_ARGS
    }

    if (!store.has(key)) {
      return Lists.MSG_EMPTY
    }

    if (!Array.isArray(store.get(key).value)) {
      stringsLogger.error(Lists.ERR_MSG_NOT_LIST)
      return Lists.ERR_MSG_NOT_LIST
    }

    const list = store.get(key).value
    const trimmedList = list.slice(parseInt(start), parseInt(stop) + 1)
    store.set(key, { ...store.get(key), value: trimmedList })

    return Lists.MSG_SUCCESS
  }
}

export default Lists
