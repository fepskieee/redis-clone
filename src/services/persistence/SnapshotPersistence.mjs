import fs from "fs/promises"
import {fileURLToPath} from "url"
import path, {dirname} from "path"
import config from "../../configs/config.json" with { type: "json" }
import { logger } from "../../configs/logger.mjs"
import store from "../../models/store.mjs"
import timer from "../../models/timer.mjs"
import { getCurrentFilename } from "../../utils/helpers.mjs"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const namespace = getCurrentFilename(import.meta.url)
const snapshotLogger = logger(namespace)

export default class SnapshotPersistence {
  DB_DEFAULT_FILE = path.join(__dirname, "snapshot.ndb")
  DIRECTORY = "data"
  SNAPSHOT_FILENAME = "snapshot.ndb"

  constructor({ dir, snapshotFilename} = {}) {
    if (config && config.directory) {
      this.dataDir = path.join(process.cwd(), config.directory)
    }
    else if (dir) {
      this.dataDir = path.join(process.cwd(), dir)
    }
    else {
      this.dataDir = path.join(process.cwd(), this.DIRECTORY)
    }
    
    if (config && config.snapshotFilename) {
      this.snapshotFilename = path.join(process.cwd(), config.snapshotFilename)
    }
    else if (snapshotFilename) {
      this.snapshotFilename = snapshotFilename
    }
    else {
      this.snapshotFilename = this.SNAPSHOT_FILENAME
    }
    
    this.db = path.resolve(this.dataDir, config.snapshotFilename) || this.DB_DEFAULT_FILE
    this.ensureDataDir()
  }

  async ensureDataDir() {
    try {
      await fs.access(this.dataDir)
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true })
    }
  }

  validateSnapshot(data) {
    return data instanceof Map
  }

  async save(data) {
    try {
      const serializedData = JSON.stringify(data, null, 2)
      await fs.writeFile(this.db, serializedData)

      const stats = await fs.stat(this.db)
      if (stats.size > 0) {
        snapshotLogger.info('Snapshot saved successfully')
        return
      }
      throw new Error("Failed to save snapshot")
    } catch (err) {
      snapshotLogger.error(`Failed saving: ${err.message}`)
    }
  }

  async load() {
    try {
      const data = await fs.readFile(this.db, "utf-8")

      const {storeMap} = JSON.parse(data)
      // const {storeMap, timerMap} = JSON.parse(data)
      if (!storeMap) {
      // if (!storeMap || !timerMap) {
        throw new Error("Invalid snapshot structure")
      }
      
      const storeSnapshot = storeMap && Object.keys(storeMap).length > 0 
      ? new Map(Object.entries(storeMap)) 
      : new Map()
      
      // const timerSnapshot = timerMap && Object.keys(timerMap).length > 0 
      // ? new Map(Object.entries(timerMap)) 
      // : new Map()
      
      snapshotLogger.info("Snapshot loaded successfully...")
      store.setStoreMap(storeSnapshot)
      // timer.setTimerMap(timerSnapshot)
    } catch (err) {
      if (err.code === "ENOENT") {
        snapshotLogger.info("Snapshot file not found. Creating a new one...")
        // const emptyData = { storeMap: {}, timerMap: {} }
        // await fs.writeFile(this.db, JSON.stringify(emptyData, null, 2))
      }

      snapshotLogger.error(`Failed to load snapshot: ${err.message}`)
    }
  }
}
