import { logger } from "../configs/logger.mjs"
import { getCurrentFilename } from "../utils/helpers.mjs"
import PersistenceManager from "./persistence/PersistenceManager.mjs"
import Strings from "./Strings.mjs"
import Lists from "./Lists.mjs"
import Sets from "./Sets.mjs"
import PubSub from "./pubsub/PubSub.mjs"

const namespace = getCurrentFilename(import.meta.url)
const nedisLogger = logger(namespace)

let persistence

const commandCategories = {
  strings: Strings,
  lists: Lists,
  sets: Sets,
  // hashes: Hash,
  // sortedSets: SortedSet,
  // hyperloglogs: Hyperlog,
  // transactions: Transactions,
  pubsub: PubSub,
  // keyspace: Keyspace,
}

const executeCommand = (data) => {
  const { parseData, type, socket } = data
  const { command, args } = parseData

  const category = commandCategories[type]
  const response = category[command](args, type, socket)

  if (persistence.mode === "aof" || persistence.mode === "both") {
    response.charAt(0) !== "-" && persistence.aofLogCommand({ command, args })
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

const initialize = async () => {
  persistence = await PersistenceManager.initialize()
  await persistence.restore()
}

export const nedis = {
  parseCommand,
  executeCommand,
  initialize,
  commandCategories,
}
