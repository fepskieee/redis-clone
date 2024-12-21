import _ from "lodash"

class NedisString {
  static MAX_MEMORY = 512 * 1024 * 1024
  static MSG_SUCCESS = "OK"
  static MSG_KEY_EXISTS = "Key already exists"
  static ERR_MSG_NOT_STRING = "ERR: value is not a string"
  static ERR_MSG_EXCEED_512MB = "ERR: Exceeds memory limit of 512MB"

  constructor() {
    this.dataString = {}
  }

  get(key) {
    const data = this.dataString[key] || "(nil)"

    return { data }
  }

  set(key, value) {
    if (_.isString(value)) {
      return { succes: true, msg: ERR_MSG_NOT_STRING }
    } else {
      const byteLength = Buffer.byteLength(value, "utf8")

      if (byteLength > NedisString.MAX_MEMORY) {
        return { succes: true, msg: ERR_MSG_EXCEED_512MB }
      }
    }

    this.dataString[key] = value

    return { sucess: true, msg: MSG_SUCCESS }
  }

  delete(key) {
    delete this.dataString[key]

    return { success: true, msg: MSG_SUCCESS }
  }

  setnx = (key, value = " ") => {
    if (key in this.dataString) {
      return MSG_KEY_EXISTS
    }

    return () => this.set(key, value)
  }

  mget = (...keys) => {
    const values = keys.map((key) => get(key))

    return values
  }
}

export default NedisString
