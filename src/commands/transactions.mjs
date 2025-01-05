import { subscribe } from "diagnostics_channel"
import { logger } from "../configs/logger.mjs"
import { flagMap, storeMap, transactionMap } from "../models/dataStore.mjs"
import nesp from "../utils/nesp.js"

export const multi = (command, args) => {
  if (!flagMap.get("MULTI").isEnabled) {
    flagMap.set("MULTI", { isEnabled: true })

    return nesp.simpleString("OK")
  }

  switch (command) {
    case "DISCARD":
      return discard()
    case "EXEC":
      return exec()
    default:
      transactionMap.add({ command, args })
      transactionMap.forEach((command) => console.log(command))

      return nesp.simpleString("QUEUED")
  }
}

export const exec = () => {
  flagMap.set("MULTI", { isEnabled: false })
  transactionMap.clear()

  return nesp.simpleString("DONE")
}

export const discard = () => {
  console.log("discard")

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
