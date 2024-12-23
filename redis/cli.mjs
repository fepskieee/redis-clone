import { isTerminate, parseCommand } from "./helpers/helpers.mjs"
import { input } from "./libs/stdio.mjs"
import { COLORS } from "./constants/colors.mjs"
import Nedis from "./Nedis.mjs"

async function main() {
  const nedis = new Nedis()
  const { host, port } = nedis.config
  const url = host.concat(":", port, "> ")

  let userInput = ""

  while (!isTerminate(userInput)) {
    userInput = await input(url)
    const { command, args } = parseCommand(userInput)
    nedis.commands(command, args)
    // switch (command) {
    //   case "exit":
    //     break
    //   case "get":
    //     nedis[command](key)
    //     break
    //   case "set":
    //     nedis.set(key, value)
    //     break
    //   case "del":
    //     nedis.del(key)
    //     break
    //   case "print":
    //     nedis.printStore()
    //     break
    //   case "setnx":
    //     console.log(nedis.setnx(key, value))
    //     break
    //   default:
    //     console.log(`ERR: Unknown command '${userInput}'\r\n`)
    // }
  }

  console.log("\nExiting Nedis...\n")
  return 0
}

main()
