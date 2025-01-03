import fs from "fs/promises"
import path from "path"
import pLimit from "p-limit"
import config from "../../configs/config.json" with { type: "json" }
import { lookUpCommand } from "../../models/command-lookup.mjs"
import { nedis } from "../nedis.mjs"

export default class AOFPersistence {
  
  constructor() {
    this.dataDir = path.join(process.cwd(), config.directory)
    this.aofPath = path.join(this.dataDir, config.aofFilename)
    this.limit = pLimit(100);
    this.ensureDataDir()
  }

  async ensureDataDir() {
    try {
      await fs.access(this.dataDir)
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true })
    }
  }

  async append({command, args}) {
    const entry = JSON.stringify({ command, args }) + "\n"
    await this.limit(() => fs.appendFile(this.aofPath, entry))
  }

  async replay() {
    try {
      const data = await fs.readFile(this.aofPath, "utf-8")
      const commands = data.split("\n").filter((line) => line)
      
      for (const line of commands) {
        const { command, args } = JSON.parse(line)
        const { type } = lookUpCommand(command)

        nedis.executeCommand({ parseData: { command, args }, type })
      }
    } catch (err) {
      if (err.code === "ENOENT") return []
      throw err
    }
  }

  async rotateLog(threshold = 1024 * 1024) {
    const stats = await fs.stat(this.aofPath)
    if (stats.size >= threshold) {
      // Create new AOF file
      // Rename old file as backup
    }
  }
}
