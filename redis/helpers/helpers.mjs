export const isTerminate = (input) => input.trim().toLowerCase() === "exit"

export const parseCommand = (input) => {
  const userInput = input.trim().toLowerCase()

  return {
    command: userInput.split(" ")[0],
    key: userInput.split(" ")[1],
    value: userInput.split(" ")[2],
  }
}
