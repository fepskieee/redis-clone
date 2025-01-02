import commands from "../database/commands.json" with { type: "json" }

export const lookUpCommand = (command) => {
  for (const type in commands) {
    if(command in commands[type]) {
      return {
        type,
        command,
        ...commands[type][command]
      }
    }
  }

  return { }
}
