export const isTerminate = (input) => input.trim().toLowerCase() === "exit"

export const parseCommand = (input) => {
  const userInput = input.trim().toLowerCase().split(" ")

  return {
    command: userInput[0],
    args: userInput.slice(1),
  }
}
