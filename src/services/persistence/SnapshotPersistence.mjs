import fsp from "fs/promises"
import {fileURLToPath} from "url"
import path, {dirname} from "path"
import config from "../../configs/config.json" with { type: "json" }
import { logger } from "../../configs/logger.mjs"
import store from "../../models/store.mjs"
import timer from "../../models/timer.mjs"
import { getCurrentFilename, isValidEntry } from "../../utils/helpers.mjs"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const namespace = getCurrentFilename(import.meta.url)
const snapshotLogger = logger(namespace)

export default class SnapshotPersistence {
  DB_DEFAULT_FILE = path.join(__dirname, "snapshot.ndb")

  constructor({ dir, snapshotFilename} = {}) {
    if (config && config.directory) {
      this.dataDir = path.join(process.cwd(), config.directory)
    }
    else if (dir) {
      this.dataDir = path.join(process.cwd(), dir)
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
    return data instanceof Map
  }

  async save(data) {
    try {
      const serializedData = JSON.stringify(data, null, 2)
      await fsp.writeFile(this.db, serializedData)

      const stats = await fsp.stat(this.db)
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
      const data = await fsp.readFile(this.db, "utf-8")
      const parseData = JSON.parse(data)
      
      if (!parseData?.storeData || !parseData?.timerData) {
        throw new Error("Invalid snapshot structure")
      }

      const storeSnapshot = new Map(Object.entries(parseData.storeData))
      const timerSnapshot = new Map(Object.entries(parseData.timerData))

      snapshotLogger.info("Snapshot loaded successfully...")
      store.setStoreMap(storeSnapshot)
      timer.setTimerMap(timerSnapshot)
    } catch (err) {
      snapshotLogger.error(`Failed to load snapshot: ${err.message}`)
    }
  }
}
