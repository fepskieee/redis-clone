import readline from "readline"
import { Buffer } from "node:buffer"

const createInterface = () => {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
}

export const input = (message) => {
  const readlineInterface = createInterface()

  return new Promise((resolve) => {
    try {
      readlineInterface.question(message, (rawUserInput) => {
        readlineInterface.close()
        resolve(rawUserInput.trim())
      })
    } catch (err) {
      console.error("Error reading input:", err)
      readlineInterface.close()
      reject(err)
    }
  })
}
