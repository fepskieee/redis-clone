import { logger, logWithLine } from "../configs/logger.mjs"
import { getCurrentFilename } from "../utils/helpers.mjs"
import Strings from "./Strings.mjs"
import Lists from "./Lists.mjs"
import PersistenceManager from "./persistence/PersistenceManager.mjs"

const namespace = getCurrentFilename(import.meta.url)
const nedisLogger = logger(namespace)

const persistence = new PersistenceManager()

const commandCategories = {
  strings: Strings,
  lists: Lists,
  // sets: Sets,
  // hashes: Hash,
  // sortedSets: SortedSet,
  // hyperloglogs: Hyperlog,
  // transactions: Transactions,
  // pubsub: PubSub,
  // keyspace: Keyspace,
}

const executeCommand = (data) => {
  const { parseData, type, socket } = data
  const { command, args } = parseData

  const category = commandCategories[type]
  const response = category[command](args, type, socket)

  if (response.charAt(0) !== "-") {
    nedisLogger.info(`Received: ${command} ${args.join(" ")}`)
    persistence.logCommand({ command, args })
  }

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
  nedisLogger.info(`Initializing Nedis...`)

  nedisLogger.info("Persistence mode: in-memory")
  // if (config.snapshot === "aof") {
  //   nedisLogger.info("Persistence mode: append-only-file")
  // } else if (config.snapshot === "snapshot") {
  //   nedisLogger.info("Persistence mode: snapshot")
  // } else nedisLogger.info("Persistence mode: in-memory")
  // persistence.restore()
}

export const nedis = { parseCommand, executeCommand, initialize }
