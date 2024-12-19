class Nedis {
  constructor() {
    const SHORT_DURATION = 10000
    const MEDIUM_DURATION = 20000
    const LONG_DURATION = 30000
    const DEFAULT_DURATION = 3000

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
    return this.data[key] || "null"
  }

  set(key, value) {
    this.data[key] = value
    return "OK"
  }

  del(key) {
    delete this.data[key]

    return "OK"
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
