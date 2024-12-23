import _ from "lodash"

class NedisString {
  static MAX_MEMORY = 512 * 1024 * 1024
  static MSG_SUCCESS = "OK"
  static MSG_KEY_EXISTS = "Key already exists"
  static ERR_MSG_NOT_STRING = "ERR: value is not a string"
  static ERR_MSG_EXCEED_512MB = "ERR: Exceeds memory limit of 512MB"

  constructor(dataStore) {
    this.dataStore = dataStore
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

    const [key, value] = args

    if (!_.isString(value)) {
      return NedisString.ERR_MSG_NOT_STRING
    } else {
      const byteLength = Buffer.byteLength(value, "utf8")

      if (byteLength > NedisString.MAX_MEMORY) {
        return { succes: false, msg: NedisString.ERR_MSG_EXCEED_512MB }
      }
    }

    this.dataStore.set(key, { type: "string", value: value })

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
