import { isTerminate, parseCommand } from "./helpers/helpers.mjs"
import { input } from "./libs/stdio.mjs"
import { COLORS } from "./constants/colors.mjs"
import Nedis from "./Nedis.mjs"

async function main() {
  const nedis = new Nedis()
  let userInput = ""

  while (!isTerminate(userInput)) {
    userInput = await input("Nedis> ")

    const { command, key, value } = parseCommand(userInput)

    switch (command) {
      case "exit":
        break
      case "get":
        console.log("GET command")
        console.log(nedis.get(key))
        break
      case "set":
        const result = nedis.set(key, value)

        console.log(
          `\n${COLORS.GREEN}${result}${COLORS.RESET} { "${key}": "${value}" }\n`
        )
        break
      case "del":
        console.log("DEL command")
        console.log(nedis.del(key))
        break
      default:
        console.log(`Unknown command '${userInput}'`)
    }
  }

  console.log("\nExiting Nedis...\n")
  return 0
}

main()
