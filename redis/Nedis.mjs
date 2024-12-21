class Nedis {
  static MAX_MEMORY = 512 * 1024 * 1024

  constructor() {
    const SHORT_DURATION = 10000
    const MEDIUM_DURATION = 20000
    const LONG_DURATION = 30000
    const DEFAULT_DURATION = 3000
    this.config = {
      host: "127.0.0.1",
      port: 6379,
      password: null,
      ttl: DEFAULT_DURATION,
      shortDuration: SHORT_DURATION,
      mediumDuration: MEDIUM_DURATION,
      longDuration: LONG_DURATION,
    }

    this.data = {}
  }

  commands = (cmd, args) => {
    if (!cmd in this) return "ERR: Unknown command"

    return this[cmd](...args)
  }

  // get = (key) => {
  //   return this.data[key] || "(nil)\r\n"
  // }

  // set = (key, value) => {
  //   const byteLength = Buffer.byteLength(value, "utf8")
  //   if (byteLength > Nedis.MAX_MEMORY) {
  //     return "ERR: Exceeds memory limit of 512MB"
  //   }

  //   this.data[key] = value

  //   return "OK\r\n"
  // }

  // setnx = (key, value = " ") => {
  //   if (key in this.data) {
  //     return "(integer) 0\r\n"
  //   }

  //   this.set(key, value)
  //   return "(integer) 1\r\n"
  // }

  // mget = (...keys) => {
  //   return keys.map((key, index) => {
  //     let value = get(key)

  //     console.log(`${index + 1}: ${value}`)

  //     return value
  //   })
  // }

  // incrby = (key, value) => {
  //   const counter = parseInt(value) || 1

  //   if (key in this.data) {
  //     this.data[key] = parseInt(this.data[key]) + counter

  //     return this.data[key]
  //   }

  //   return this.set(key, 0)
  // }

  // incr = (key) => {
  //   this.incrby(key)
  // }

  // del = (key) => {
  //   delete this.data[key]

  //   return "OK\r\n"
  // }

  exists = (key) => {
    return key in this.data ? "1" : "0"
  }

  keys = (limit = 10, offset = 0) => {
    const allKeys = Object.keys(this.data)

    return allKeys.slice(offset, offset + limit)
  }

  setWithTTL = (key, value, ttl) => {
    if (ttl === undefined || ttl === null) {
      ttl = this.config.ttl
    }

    this.set(key, value)

    setTimeout(() => this.del(key), ttl)

    return "OK"
  }
}

export default Nedis
