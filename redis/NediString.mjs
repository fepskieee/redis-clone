import _ from "lodash"

class NediString {
  static MAX_MEMORY = 512 * 1024 * 1024
  static MSG_SUCCESS = "OK"
  static MSG_KEY_EXISTS = "Key already exists"
  static ERR_MSG_NOT_STRING = "ERR: value is not a string"
  static ERR_MSG_EXCEED_512MB = "ERR: Exceeds memory limit of 512MB"

  constructor(dataStore, expirationTimers) {
    this.dataStore = dataStore
    this.expirationTimers = expirationTimers
  }

  get(args) {
    if (args.length !== 1)
      return console.log("-ERR: Wrong number of arguments for GET command\r\n")

    const [key] = args

    if (this.dataStore.get(key).type !== "string") {
      return console.log(
        "ERR: WRONGTYPE Operation for keys with non-string values\r\n"
      )
    }

    console.log(this.dataStore.get(key).value || "(nil)", "\r\n")
  }

  set(args) {
    if (args.length < 2)
      return console.log("-ERR: Wrong number of arguments for SET command\r\n")

    const [key, value, ttlArg] = args
    const ttl = Number.isInteger(ttlArg) && ttlArg > 0 ? ttlArg : 10000

    if (!_.isString(value)) {
      return console.log(NediString.ERR_MSG_NOT_STRING, "\r\n")
    }

    const byteLength = Buffer.byteLength(value, "utf8")

    if (byteLength > NediString.MAX_MEMORY) {
      return console.log(NediString.ERR_MSG_EXCEED_512MB, "\r\n")
    }

    this.dataStore.set(key, { type: "string", value: value })

    if (this.expirationTimers.has(key)) {
      const checkExistingTimer = this.expirationTimers.get(key)?.timeoutId
      if (checkExistingTimer) {
        clearTimeout(this.expirationTimers.get(key).timeoutId)
        clearInterval(this.expirationTimers.get(key).intervalId)
        this.expirationTimers.delete(key)
      }
    }

    let timeoutId = null
    let intervalId = null
    let remainingTime = null

    if (Number.isInteger(ttl) && ttl > 0) {
      let startTime = Date.now()

      intervalId = setInterval(() => {
        const elapsedTime = Date.now() - startTime
        remainingTime = Math.max(ttl - elapsedTime, 0) / 1000

        remainingTime = Math.round(remainingTime)

        const timerKey = this.expirationTimers.get(key)
        if (timerKey) {
          timerKey.remainingTime = remainingTime
        }
      }, 1000)

      timeoutId = setTimeout(() => {
        clearTimeout(this.expirationTimers.get(key).timeoutId)
        clearInterval(this.expirationTimers.get(key).intervalId)
        this.expirationTimers.delete(key)
        this.dataStore.delete(key)
      }, ttl)
    }

    this.expirationTimers.set(key, {
      timeoutId,
      intervalId,
    })

    console.log("OK\r\n")
  }

  setnx(key, value = " ") {
    if (this.dataStore.has(key)) {
      console.log(NediString.MSG_KEY_EXISTS, "\r\n")

      return
    }

    this.set(key, value)
  }

  mget = (...keys) => {
    const values = keys.map((key) => get(key))

    return values
  }
}

export default NediString
