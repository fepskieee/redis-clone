class NediList {
  static ERR_THROW_NUMBER_OF_ARGS = (commandName) => {
    throw new Error(
      `ERR wrong number of arguments for '${commandName}' command`
    )
  }

  constructor(dataStore, expirationTimers) {
    this.dataStore = dataStore
    this.expirationTimers = expirationTimers
  }

  lpush(args) {
    const [key, data] = args

    if (args.length < 2 || data === null || data === undefined) {
      NediList.ERR_THROW_NUMBER_OF_ARGS("lpush")
    }

    if (!this.dataStore.has(key)) {
      this.dataStore.set(key, { type: "list", values: [] })
    }

    const stringifiedData = data.map((element) => `${element}`)

    this.dataStore.get(key).values.push(...stringifiedData)

    return this.dataStore.get(key).values.length
  }

  /**
   * Removes and returns the first `count` elements from the list stored at `key`.
   * If `count` is not specified, it defaults to 1.
   * If the key does not exist or the list is empty, it returns null.
   *
   * @param {Array} params - An array containing the key and optionally the count.
   * @param {string} params[0] - The key of the list.
   * @param {number} [params[1]=1] - The number of elements to remove.
   * @returns {Array|null} An array of the removed elements, or null if the key does not exist or the list is empty.
   */
  lpop([key, count = 1]) {
    if (key === undefined) {
      NediList.ERR_THROW_NUMBER_OF_ARGS("lpop")
    }

    if (!this.dataStore.has(key)) return null
    if (this.dataStore.get(key).values.length === 0) return null

    const arrCurrentValues = [...this.dataStore.get(key).values]
    const arrPoppedElements = []

    for (let index = 0; index < count; index++) {
      if (index >= arrCurrentValues.length) {
        break
      }

      arrPoppedElements.push(this.dataStore.get(key).values.pop())
    }

    return [...arrPoppedElements]
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
