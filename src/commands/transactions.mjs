import { subscribe } from "diagnostics_channel"
import { logger } from "../configs/logger.mjs"
import { flagMap, storeMap, transactionMap } from "../models/dataStore.mjs"
import { lookUpCommand } from "../models/command-lookup.mjs"
import nedis from "../services/nedis.mjs"
import nesp from "../utils/nesp.js"

export const multi = (command, args) => {
  if (!flagMap.get("MULTI").isEnabled) {
    flagMap.set("MULTI", { isEnabled: true })

    return nesp.multi()
  }

  switch (command) {
    case "DISCARD":
      return discard()
    case "EXEC":
      return exec()
    default:
      transactionMap.add({ command, args })

      return nesp.simpleString("QUEUED")
  }
}

export const exec = () => {
  if (!flagMap.get("MULTI").isEnabled) {
    return nesp.simpleError("ERR EXEC without MULTI")
  }

  flagMap.set("MULTI", { isEnabled: false })

  const response = []
  transactionMap.forEach((commands) => {
    const { command, args } = commands
    const { type } = lookUpCommand(command)
    const result = nedis.executeCommand({ parseData: { command, args }, type })
    response.push(result)
  })

  transactionMap.clear()

  return nesp.exec(response)
  // return nesp.simpleString("DONE")
}

export const discard = () => {
  if (!flagMap.get("MULTI").isEnabled) {
    return nesp.simpleError("ERR DISCARD without MULTI")
  }

  flagMap.set("MULTI", { isEnabled: false })
  transactionMap.clear()

  return nesp.simpleString("OK")
}

export const watch = () => {
  console.log("watch")

  return nesp.simpleString("OK")
}

const transactions = {
  MULTI: multi,
  EXEC: exec,
  DISCARD: discard,
  WATCH: watch,
}

export default transactions
