import config from "../../configs/config.json" with { type: "json" }
import { logger } from "../../configs/logger.mjs"
import store from "../../models/store.mjs"
import AOFPersistence from "./AOFPersistence.mjs"
import SnapshotPersistence from "./SnapshotPersistence.mjs"
import { getCurrentFilename } from "../../utils/helpers.mjs"

const namespace = getCurrentFilename(import.meta.url)
const pmLogger = logger(namespace)

export default class PersistenceManager {
  snapshotIntervalMs = config.snapshotInterval
  mode = config.mode
  
  static async initialize(dir, aofFilename) {
    const instance = new PersistenceManager()
    instance.aof = await AOFPersistence.initialize(dir, aofFilename)
    instance.snapshot = await SnapshotPersistence.initialize(dir, aofFilename)

    if (instance.mode === "snapshot" || instance.mode === "both") {
      instance.startSnapshotScheduler(this.snapshotIntervalMs || 0)
    }

    pmLogger.info(`Persistence mode: ${instance.mode}`)
    return instance
  }

  startSnapshotScheduler(intervalMs) {
    if (intervalMs === 0) return

    setInterval(async () => {
      await this.saveSnapshot()
    }, intervalMs)
  }

  async aofLogCommand(data) {
    try {
      await this.aof.append(data)
    } catch (err) {
      pmLogger.error(err, `Failed to log command: ${err}`)
      
      throw new Error("Persistence error")
    }
  }

  async saveSnapshot() {
    try {
      const snapshot = {
        storeMap: Object.fromEntries(store.getStoreMap()),
      }

      await this.snapshot.save(snapshot)
    } catch (err) {
      pmLogger.error(err, `Failed to save snapshot: ${err.message}`)
    }
  }

  async restore() {
    try {
      if(this.mode === "snapshot" || this.mode === "both") { 
        await this.snapshot.load()
      }

      if(this.mode === "aof" || this.mode === "both") {
        await this.aof.rotateLog()
        await this.aof.replay()
      }
    } catch (err) {
      pmLogger.error(`Failed to restore data: ${err}`)
    }
  }
}
