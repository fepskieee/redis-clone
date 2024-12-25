class NedisList {
  constructor(dataStore, expirationTimers) {
    this.dataStore = dataStore
    this.expirationTimers = expirationTimers
  }

  lpush(args) {
    const [key, values] = args

    this.dataStore.set(key, values)
  }

  rpush(key, ...values) {
    if (!Array.isArray(this.dataStore[key])) {
      this.dataStore[key] = []
    }
    this.dataStore[key].push(...values)
    return this.dataStore[key].length
  }

  lpop(key) {
    if (!Array.isArray(this.dataStore[key])) return null
    return this.dataStore[key].shift() || null
  }

  rpop(key) {
    if (!Array.isArray(this.dataStore[key])) return null
    return this.dataStore[key].pop() || null
  }

  llen(key) {
    return Array.isArray(this.dataStore[key]) ? this.dataStore[key].length : 0
  }

  lindex(key, index) {
    if (!Array.isArray(this.dataStore[key])) return null
    return this.dataStore[key][index] ?? null
  }
}

export default NedisList
