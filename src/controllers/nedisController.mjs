import { logger } from "../configs/logger.mjs"
import { getCurrentFilename } from "../utils/helpers.mjs"

const namespace = getCurrentFilename(import.meta.url)
const nedisLogger = logger(namespace)

const executeCommand = (cmd) => {
  console.log("execute")
}

const parseCommand = (bufferData) => {
  const cmd = bufferData[2].toUpperCase()
  nedisLogger.info(cmd)

  return `+OK\r\n`
}

export { parseCommand }
