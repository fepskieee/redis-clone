import readline from "readline"

const createInterface = () => {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
}

const input = () => {
  const readlineInterface = createInterface()
  const msg = "Nedis> "

  return new Promise((resolve) => {
    readlineInterface.question(msg, (answer) => {
      readlineInterface.close()

      resolve(answer)
    })
  })
}

export { input }
