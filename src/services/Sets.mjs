import store from "../models/store.mjs"

class Sets {
  static MSG_SUCCESS = "+OK\r\n"
  static MSG_EMPTY = "$-1\r\n"
  static ERR_MSG_SYNTAX_ERROR = "-ERR syntax error\r\n"
  static ERR_MSG_WRONG_NUMBER_ARGS = "-ERR wrong number of arguments\r\n"
  static ERR_MSG_NOT_SET = "-ERR value is not a set\r\n"

  static SADD([key, ...members], type) {
    if (arguments[0].length < 2) {
      stringsLogger.error(Sets.ERR_MSG_WRONG_NUMBER_ARGS)
      return Sets.ERR_MSG_WRONG_NUMBER_ARGS
    }

    if (!store.has(key)) {
      store.set(key, { type, value: new Set() })
    }

    if (!(store.get(key).value instanceof Set)) {
      stringsLogger.error(Sets.ERR_MSG_NOT_SET)
      return Sets.ERR_MSG_NOT_SET
    }

    const set = store.get(key).value
    let addedCount = 0
    members.forEach((member) => {
      if (!set.has(member)) {
        set.add(member)
        addedCount++
      }
    })
    store.set(key, { ...store.get(key), value: set })

    return `:${addedCount}\r\n`
  }

  static SMEMBERS([key], type) {
    if (arguments[0].length !== 1) {
      stringsLogger.error(Sets.ERR_MSG_WRONG_NUMBER_ARGS)
      return Sets.ERR_MSG_WRONG_NUMBER_ARGS
    }

    if (!store.has(key)) {
      return Sets.MSG_EMPTY
    }

    if (!(store.get(key).value instanceof Set)) {
      stringsLogger.error(Sets.ERR_MSG_NOT_SET)
      return Sets.ERR_MSG_NOT_SET
    }

    const set = store.get(key).value
    const result = [...set]
      .map((member) => `$${member.length}\r\n${member}\r\n`)
      .reduce((acc, curr) => acc + curr, `*${set.size}\r\n`)

    return result
  }

  static SREM([key, ...members], type) {
    if (arguments[0].length < 2) {
      stringsLogger.error(Sets.ERR_MSG_WRONG_NUMBER_ARGS)
      return Sets.ERR_MSG_WRONG_NUMBER_ARGS
    }

    if (!store.has(key)) {
      return Sets.MSG_EMPTY
    }

    if (!(store.get(key).value instanceof Set)) {
      stringsLogger.error(Sets.ERR_MSG_NOT_SET)
      return Sets.ERR_MSG_NOT_SET
    }

    const set = store.get(key).value
    members.forEach((member) => set.delete(member))
    store.set(key, { ...store.get(key), value: set })

    return `:${set.size}\r\n`
  }

  static SISMEMBER([key, member], type) {
    if (arguments[0].length !== 2) {
      stringsLogger.error(Sets.ERR_MSG_WRONG_NUMBER_ARGS)
      return Sets.ERR_MSG_WRONG_NUMBER_ARGS
    }

    if (!store.has(key)) {
      return ":0\r\n"
    }

    if (!(store.get(key).value instanceof Set)) {
      stringsLogger.error(Sets.ERR_MSG_NOT_SET)
      return Sets.ERR_MSG_NOT_SET
    }

    const set = store.get(key).value
    return set.has(member) ? ":1\r\n" : ":0\r\n"
  }

  static SINTER(keys, type) {
    if (arguments[0].length < 2) {
      stringsLogger.error(Sets.ERR_MSG_WRONG_NUMBER_ARGS)
      return Sets.ERR_MSG_WRONG_NUMBER_ARGS
    }

    const sets = keys.map((key) => {
      if (!store.has(key)) {
        return new Set()
      }

      if (!(store.get(key).value instanceof Set)) {
        stringsLogger.error(Sets.ERR_MSG_NOT_SET)
        return Sets.ERR_MSG_NOT_SET
      }

      return store.get(key).value
    })

    const intersection = sets.reduce((acc, set) => {
      return new Set([...acc].filter((member) => set.has(member)))
    })

    const result = [...intersection]
      .map((member) => `$${member.length}\r\n${member}\r\n`)
      .reduce((acc, curr) => acc + curr, `*${intersection.size}\r\n`)

    return result
  }

  static SCARD([key], type) {
    if (arguments[0].length !== 1) {
      stringsLogger.error(Sets.ERR_MSG_WRONG_NUMBER_ARGS)
      return Sets.ERR_MSG_WRONG_NUMBER_ARGS
    }

    if (!store.has(key)) {
      return ":0\r\n"
    }

    if (!(store.get(key).value instanceof Set)) {
      stringsLogger.error(Sets.ERR_MSG_NOT_SET)
      return Sets.ERR_MSG_NOT_SET
    }

    const set = store.get(key).value
    return `:${set.size}\r\n`
  }
}

export default Sets
