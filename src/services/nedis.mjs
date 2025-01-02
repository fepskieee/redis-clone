import { logger, logWithLine } from "../configs/logger.mjs"
import { getCurrentFilename } from "../utils/helpers.mjs"
import Strings from "./Strings.mjs"
import PersistenceManager from "./persistence/PersistenceManager.mjs"

const namespace = getCurrentFilename(import.meta.url)
const nedisLogger = logger(namespace)

const persistence = new PersistenceManager()

const commandCategories = {
  strings: (command, args, category) => Strings[command](args, category),
  lists: (command, args, category) => Strings[command](args, category),
  sets: (command, args, category) => Strings[command](args, category),
  hashes: (command, args, category) => Strings[command](args, category),
  sortedSets: (command, args, category) => Strings[command](args, category),
  hyperloglogs: (command, args, category) => Strings[command](args, category),
  transactions: (command, args, category) => Strings[command](args, category),
  pubsub: (command, args, category) => Strings[command](args, category),
  keyspace: (command, args, category) => Strings[command](args, category),
}

const executeCommand = ({ command, args }, category) => {
  const response = commandCategories[category](command, args, category)
  persistence.logCommand(command, args)

  return response
}

const parseCommand = (data) => {
  const parseData = data
    .toString()
    .split("\r\n")
    .filter((line) => !!line)

  const numArgs = parseData[0] - 1
  const command = parseData[2].toUpperCase()
  const args = parseData.slice(4).filter((_, index) => index % 2 === 0)

  return { numArgs, command, args }
}

const initialize = () => {
  nedisLogger.info("Persistence mode: in-memory")
  // persistence.restore()
}

export const nedis = { parseCommand, executeCommand, initialize }
