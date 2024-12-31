import commands from "../database/commands.json" with { type: "json" }

export const lookUpCommand = (command) => {
  for (const category in commands) {
    if(command in commands[category]) {
      return {
        category,
        command,
        ...commands[category][command]
      }
    }
  }

  return { }
}
