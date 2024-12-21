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
    console.log(
      JSON.stringify({ dataType: "string", command: "get", args: "jhon" })
    )
    const { command, key, value } = parseCommand(userInput)

    switch (command) {
      case "exit":
        break
      case "get":
        console.log(nedis[command](key))
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
      case "setnx":
        console.log(nedis.setnx(key, value))
        break
      default:
        console.log(`ERR: Unknown command '${userInput}'\r\n`)
    }
  }

  console.log("\nExiting Nedis...\n")
  return 0
}

main()
