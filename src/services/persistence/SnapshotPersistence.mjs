import fsp from "fs/promises"
import {fileURLToPath} from "url"
import path, {dirname} from "path"
import config from "../../configs/config.json" with { type: "json" }
import { logger } from "../../configs/logger.mjs"
import { getCurrentFilename, isValidEntry } from "../../utils/helpers.mjs"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const namespace = getCurrentFilename(import.meta.url)
const snapshotLogger = logger(namespace)

export default class SnapshotPersistence {
  DB_DEFAULT_FILE = path.join(__dirname, "snapshot.rdb")

  constructor({ dataDir, snapshotFilename} = {}) {
    if (config && config.dataDir) {
      this.dataDir = path.join(process.cwd(), config.dataDir)
    }
    else if (dataDir) {
      this.dataDir = path.join(process.cwd(), dataDir)
    }
    
    if (config && config.snapshotFilename) {
      this.snapshotFilename = path.join(process.cwd(), config.snapshotFilename)
    }
    else if (snapshotFilename) {
      this.snapshotFilename = snapshotFilename
    }
    
    this.db = path.resolve(this.dataDir, config.snapshotFilename) || this.DB_DEFAULT_FILE
  }

  validateSnapshot(data) {
    return data && (isValidEntry(data) || data instanceof Map)
  }

  async save(data) {
    const serializedData = JSON.stringify(data)

    try {
      await fsp.writeFile(this.db, serializedData)
      snapshotLogger.info(`Saved data store to file: ${this.db}`)
    } catch (err) {
      snapshotLogger.info(`Failed to save snapshot: ${err.message}`)
    }
  }

  async load() {
    if (!fsp.access(this.db)) return
    
    try {
      const data = await fsp.readFiles(this.db, "utf-8")
      const parseData = JSON.parse(data) || {}

      if (!this.validateSnapshot(parseData.store) && !this.validateSnapshot(parseData.timer)) {
        snapshotLogger.error("Snapshot is corrupted")
        return new Map()
      }
        
      snapshotLogger.info("Loaded data store successfully...")

      return parseData
    } catch (err) {
      snapshotLogger.error(`Failed to load snapshot: ${err.message}`)
    }
  }
}
