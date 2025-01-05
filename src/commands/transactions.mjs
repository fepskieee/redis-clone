import { logger } from "../configs/logger.mjs"
import { storeMap } from "../models/dataStore.mjs"
import nesp from "../utils/nesp.js"

export const multi = () => {
  console.log("multi")
  return nesp.simpleString("OK")
}

export const exec = () => {
  console.log("exec")
  return nesp.simpleString("OK")
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
