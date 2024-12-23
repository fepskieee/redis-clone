import _ from "lodash"

class NedisString {
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

    const [key, value, ttl = 10000] = args || []
    let timeoutId = null
    let remainingTime = -1

    if (!_.isString(value)) {
      return NedisString.ERR_MSG_NOT_STRING
    } else {
      const byteLength = Buffer.byteLength(value, "utf8")

      if (byteLength > NedisString.MAX_MEMORY) {
        return { succes: false, msg: NedisString.ERR_MSG_EXCEED_512MB }
      }
    }

    if (this.expirationTimers.has(key)) {
      clearTimeout(this.expirationTimers.get(key).timeoutId)
    }

    if (ttl) {
      let startTime = Date.now()

      const intervalId = setInterval(() => {
        const elapsedTime = Date.now() - startTime
        const getRemainingTime = Math.max(ttl - elapsedTime, 0) / 1000

        remainingTime = Math.round(getRemainingTime)

        const timer = this.expirationTimers.get(key)
        timer.remainingTime = remainingTime
      }, 1000)

      timeoutId = setTimeout(() => {
        clearTimeout(this.expirationTimers.get(key).timeoutId)
        clearInterval(intervalId)
        this.expirationTimers.delete(key)
        this.dataStore.delete(key)
      }, ttl)
    }

    this.dataStore.set(key, { type: "string", value: value })
    this.expirationTimers.set(key, {
      timeoutId,
    })

    console.log("OK\r\n")
  }

  setnx(key, value = " ") {
    if (this.dataStore.has(key)) {
      console.log(NedisString.MSG_KEY_EXISTS, "\r\n")

      return
    }

    this.set(key, value)
  }

  mget = (...keys) => {
    const values = keys.map((key) => get(key))

    return values
  }
}

export default NedisString
