import NedisString from "./NedisString.mjs"

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

    this.dataStore = new Map()
    this.expirationTimers = new Map()

    this.nedisString = new NedisString(this.dataStore, this.expirationTimers)
  }

  commands = (cmd, args) => {
    if (typeof this[cmd] !== "function") {
      return "ERR: Unknown command"
    }

    this[cmd](args)
  }

  get(args) {
    this.nedisString.get(args)
  }

  set(args) {
    this.nedisString.set(args)
  }

  setnx(key, value) {
    this.nedisString.setnx(key, value)
  }

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

  del(key) {
    if (!this.dataStore.has(key)) {
      console.log("ERR: Key not found!")
    }

    this.dataStore.delete(key)
    console.log("OK\r\n")
  }

  print() {
    console.log(this.dataStore, "\r\n")
    console.log(this.expirationTimers.get("name"), "\r\n")
  }

  exist = (key) => {
    console.log(this.dataStore.has(key), "\r\n")
  }

  keys = (limit = 10, offset = 0) => {
    const filteredDataStore = Array.from(this.dataStore.entries()).slice(
      offset,
      limit
    )
    filteredDataStore.forEach(([key, value], index) =>
      console.log(`${index + 1}) ${key}: ${value}`)
    )
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
