import { logger } from "../configs/logger.mjs"
import store from "../models/store.mjs"
import timer from "../models/timer.mjs"
import { getCurrentFilename } from "../utils/helpers.mjs"

const namespace = getCurrentFilename(import.meta.url)
const keyspaceLogger = logger(namespace)

class Keyspace {
  static DEL([key]) {
    if (!key) {
      return `:0\r\n`
    }

    if (!store.has(key)) {
      return `:0\r\n`
    }

    store.del(key)
    timer.del(key)

    return `:1\r\n`
  }

  static EXPIRE([key, seconds]) {
    if (!key || !seconds) {
      return `:0\r\n`
    }

    if (!store.has(key)) {
      return `:0\r\n`
    }

    const ttl = Number(seconds) * 1000
    let startTime = Date.now()
    let remainingTime = 0

    const intervalId = setInterval(() => {
      const elapsedTime = Date.now() - startTime
      remainingTime = Math.max(ttl - elapsedTime, 0) / 1000
      remainingTime = Math.round(remainingTime)

      if (timer.has(key)) {
        timer.get(key).remainingTime = remainingTime
      }
    }, 1000)

    const timeoutId = setTimeout(() => {
      clearTimeout(timer.get(key).timeoutId)
      clearInterval(timer.get(key).intervalId)
      store.del(key)
      timer.del(key)
    }, ttl)

    timer.set(key, {
      timeoutId,
      intervalId,
      ttl,
    })

    return `:1\r\n`
  }

  static TTL([key]) {
    if (!store.has(key)) {
      return `:-2\r\n`
    }

    const expirationTime = timer.get(key)
    if (expirationTime === undefined) {
      return `:-1\r\n`
    }
    const ttl = timer.get(key).remainingTime
    return `:${ttl}\r\n`
  }
}

export default Keyspace
