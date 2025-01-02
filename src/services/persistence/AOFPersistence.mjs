import fs from "fs/promises"
import path from "path"
import config from "../../configs/config.json" with { type: "json" }
import store from "../../models/store.mjs"

export default class AOFPersistence {
  constructor() {
    this.dataDir = path.join(process.cwd(), config.directory)
    this.aofPath = path.join(this.dataDir, config.aofFilename)
    this.ensureDataDir()
  }

  async ensureDataDir() {
    try {
      await fs.access(this.dataDir)
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true })
    }
  }

  async append(command, args) {
    const entry = JSON.stringify({ command, args }) + "\n"
    await fs.appendFile(this.aofPath, entry)
  }

  serializeCommand(command, args) {
    return JSON.stringify({
      timestamp: Date.now(),
      command,
      type: command.type,
      args: args.map((arg) => arg.toString()),
    })
  }

  // formatCommand(command, args) {
  //   return JSON.stringify({
  //     timestamp: Date.now(),
  //     command,
  //     args,
  //   })
  // }

  async replay() {
    try {
      const data = await fs.readFile(this.aofPath, "utf-8")
      const commands = data.split("\n").filter((line) => line)

      for (const line of commands) {
        const { command, args } = JSON.parse(line)
        await store[command.toLowerCase()](...args)
      }
    } catch (err) {
      if (err.code === "ENOENT") return []
      throw err
    }
  }

  async rotateLog(threshold = 1024 * 1024) {
    // 1MB
    const stats = await fs.stat(this.aofPath)
    if (stats.size >= threshold) {
      // Create new AOF file
      // Rename old file as backup
    }
  }
}
