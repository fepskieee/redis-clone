import { logger } from "../configs/logger.mjs"
import { getCurrentFilename } from "../utils/helpers.mjs"

const namespace = getCurrentFilename(import.meta.url)
const nedisLogger = logger(namespace)

const executeCommand = (keys, args) => {
  console.log("execute")
}

const parseCommand = (data) => {
  const parseData = data
    .toString()
    .split("\r\n")
    .filter((line) => !!line)

  const command = parseData[2].toUpperCase()
  const args = parseData.slice(4).filter((_, index) => index % 2 === 0)

  nedisLogger.info(`RECEIVE: ${command} ${args.join(" ")}`)

  return { command, args }
}

export const nedis = { parseCommand, executeCommand }
