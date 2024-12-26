import { isTerminate, parseCommand } from "./helpers/helpers.mjs"
import { input } from "./libs/stdio.mjs"
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
  }

  console.log("\nExiting Nedis...\n")
  return 0
}

main()
