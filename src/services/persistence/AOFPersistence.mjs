import fs from "fs/promises"
import path from "path"
import pLimit from "p-limit"
import config from "../../configs/config.json" with { type: "json" }
import { logger } from "../../configs/logger.mjs"
import { lookUpCommand } from "../../models/command-lookup.mjs"
import nedis from "../nedis.mjs"
import { getCurrentFilename } from "../../utils/helpers.mjs"

const namespace = getCurrentFilename(import.meta.url)
const aofLogger = logger(namespace)

export default class AOFPersistence {
  THRESHOLD_MB = config.threshold || 64
  COUNT = 0
  DIRECTORY = config.directory || "data"
  AOF_FILENAME="appendonly.aof"

  constructor(dir, aofFilename) {
    this.aofFilename = config.aofFilename || aofFilename || this.AOF_FILENAME
    this.dataDir = path.join(process.cwd(), config.directory || dir || this.DIRECTORY)
    this.aofPath = path.join(this.dataDir, this.aofFilename)
    this.limit = pLimit(100);
    this.thresholdMB = this.THRESHOLD_MB * 1024 * 1024
  }

  async ensureDataDir() {
    try {
      await fs.access(this.dataDir)
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true })
    }
  }

  static async initialize(dir, aofFilename) {
    const instance = new AOFPersistence(dir, aofFilename)
    await instance.ensureDataDir()
    return instance
  }

  async append({command, args}) {
    try {
      await this.rotateLog()
      const entry = JSON.stringify({ command, args }) + "\n"
      await this.limit(() => fs.appendFile(this.aofPath, entry))
      return true
    } catch(err) {
      aofLogger.error(`Failed to append: ${err.message}`)
      return false
    }
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
    } catch (error) {
      if (error.code === "ENOENT") {
        aofLogger.info(`AppendOnlyFile not found. Creating a new aof file...`)
        await fs.writeFile(this.aofPath, '')
      }
    }
  }
  
  async rotateLog() {
    try {
      const stats = await fs.stat(this.aofPath)
      
      if (stats.size >= this.thresholdMB || this.COUNT > 3) {
        this.COUNT++
        aofLogger.info(`AOF file size exceeds max limit of ${this.thresholdMB/1024/1024}Mb. Rotating AOF log: ${this.aofPath}`)
        
        const backupName = `${this.aofFilename.replace(/\.aof$/, "")}${this.COUNT}.aof.bak`
        const backupPath = path.join(this.dataDir, `${backupName}`)
        
        await fs.rename(this.aofPath, backupPath)
        await fs.writeFile(this.aofPath, '')
        
        aofLogger.info(`Backup ${backupName} created successfully`)
        return
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        aofLogger.info(`AOF file not found. Creating new aof file...`)
        await fs.writeFile(this.aofPath, '')
      }
    }
  }
}
