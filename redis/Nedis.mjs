class Nedis {
  constructor() {
    const SHORT_DURATION = 10000
    const MEDIUM_DURATION = 20000
    const LONG_DURATION = 30000
    const DEFAULT_DURATION = 3000
    const MAX_MEMORY = 512 * 1024 * 1024 // 512MB

    this.config = {
      hostip: "localhost",
      hostport: 6379,
      password: null,
      ttl: DEFAULT_DURATION,
      short_duration: SHORT_DURATION,
      medium_duration: MEDIUM_DURATION,
      long_duration: LONG_DURATION,
    }

    this.data = {}
  }

  get(key) {
    return this.data[key] || "(nil)"
  }

  set(key, value) {
    const byteLength = Buffer.byteLength(value, "utf8")
    if (byteLength > MAX_MEMORY) {
      return "ERROR: Exceeds memory limit of 512MB"
    }

    this.data[key] = value

    return "OK\r\n"
  }

  setnx(key, value) {
    if (key in this.data) {
      return "ERROR: Key already exists"
    }

    return this.set(key, value)
  }

  mget(...keys) {
    return keys.map((key, index) => {
      let value = get(key)

      console.log(`${index + 1}: ${value}`)

      return value
    })
  }

  incrby(key, value) {
    if (key in this.data) {
      this.data[key] = parseInt(this.data[key]) + value

      return this.data[key]
    }

    return this.set(key, value)
  }

  incr(key) {
    if (key in this.data) {
      this.data[key] = parseInt(this.data[key]) + 1

      return this.data[key]
    }

    return this.set(key, 0)
  }

  del(key) {
    delete this.data[key]

    return "OK\r\n"
  }

  exists(key) {
    return this.data[key] !== "undefined"
  }

  keys(limit = 10, offset = 0) {
    const allKeys = Object.keys(this.data)

    return allKeys.slice(offset, offset + limit)
  }

  setWithTTL(key, value, ttl) {
    if (ttl === undefined || ttl === null) {
      ttl = this.config.ttl
    }

    this.set(key, value)

    setTimeout(() => this.del(key), ttl)

    return "OK"
  }
}

export default Nedis
