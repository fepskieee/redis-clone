class CommandProcessor {
  constructor() {
    this.store = new RedisLikeStore()
  }

  processCommand(command, key, value, ttl = null) {
    switch (command.toUpperCase()) {
      case "SET":
        return ttl
          ? this.store.setWithTTL(key, value, ttl)
          : this.store.set(key, value)
      case "GET":
        return this.store.get(key)
      case "DEL":
        return this.store.del(key)
      case "KEYS":
        return this.store.keys()
      default:
        return `ERROR: Unknown command "${command}"`
    }
  }
}

export default CommandProcessor
