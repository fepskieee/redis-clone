import commands from "../database/commands.json" with { type: "json" }

export const lookUpCommand = (command) => {
  for (const category in commands) {
    if(commands[category][command]) {
      return {
        category,
        command,
        ...commands[category][command]
      }
    }
  }

  return null
}
