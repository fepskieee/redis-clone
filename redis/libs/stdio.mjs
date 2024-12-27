import { createInterface } from "readline"

export const input = (message) => {
  const readlineInterface = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

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
