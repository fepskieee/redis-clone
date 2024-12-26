class NediList {
  static ERR_MSG_ARGS = "ERR wrong number of arguments for 'LPUSH' command"

  constructor(dataStore, expirationTimers) {
    this.dataStore = dataStore
    this.expirationTimers = expirationTimers
  }

  lpush(args) {
    if (args.length < 2) {
      throw new Error(NediList.ERR_MSG_ARGS)
    }

    const [key, data] = args

    if (data === null) return 0

    if (!this.dataStore.has(key)) {
      this.dataStore.set(key, { type: "list", value: [] })
    }

    const stringifiedData = data.map((element) => `${element}`)

    this.dataStore.get(key).value.push(...stringifiedData)

    return this.dataStore.get(key).value.length
  }

  lpop(key) {
    if (!Array.isArray(this.dataStore[key])) return null
    return this.dataStore[key].shift() || null
  }

  llen(key) {
    return Array.isArray(this.dataStore[key]) ? this.dataStore[key].length : 0
  }

  lrange(args) {
    const [key, start, stop] = args
    console.table(key, start, stop)
  }

  rpush(key, ...values) {
    if (!Array.isArray(this.dataStore[key])) {
      this.dataStore[key] = []
    }
    this.dataStore[key].push(...values)
    return this.dataStore[key].length
  }

  rpop(key) {
    if (!Array.isArray(this.dataStore[key])) return null
    return this.dataStore[key].pop() || null
  }

  lindex(key, index) {
    if (!Array.isArray(this.dataStore[key])) return null
    return this.dataStore[key][index] ?? null
  }
}

export default NediList
