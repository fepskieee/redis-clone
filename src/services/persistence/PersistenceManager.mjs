import config from "../../configs/config.json" with { type: "json" }
import { logger, logWithLine } from "../../configs/logger.mjs"
import store from "../../models/store.mjs"
import timer from "../../models/timer.mjs"
import AOFPersistence from "./AOFPersistence.mjs"
import SnapshotPersistence from "./SnapshotPersistence.mjs"
import { getCurrentFilename } from "../../utils/helpers.mjs"

const namespace = getCurrentFilename(import.meta.url)
const pmLogger = logger(namespace)

export default class PersistenceManager {
  snapshotIntervalMs = config.snapshotInterval
  mode = config.mode

  constructor() {
    this.aof = new AOFPersistence()
    this.snapshot = new SnapshotPersistence()
    this.startSnapshotScheduler(this.snapshotIntervalMs || 0)
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
      // const storeSnapshot = storeMap && Object.keys(storeMap).length > 0 
      // ? new Map(Object.entries(storeMap)) 
      // : new Map()
      
      // const timerSnapshot = timerMap && Object.keys(timerMap).length > 0 
      // ? new Map(Object.entries(timerMap)) 
      // : new Map()

      const snapshot = {
        storeMap: Object.fromEntries(store.getStoreMap()),
        // TODO: timerMap: Object.fromEntries(timer.getTimerMap())
      }

      await this.snapshot.save(snapshot)
    } catch (err) {
      pmLogger.error(err, `Failed to save snapshot: ${err.message}`)
      // throw new Error(`Snapshot error ${err.message}`)
    }
  }

  async restore() {
    try {
      if(this.mode === "snapshot" || this.mode === "both") { 
        await this.snapshot.load()
      }

      if(this.mode === "aof" || this.mode === "both") {
        await this.aof.replay()
      }
    } catch (err) {
      pmLogger.error(`Failed to restore data: ${err}`)
    }
  }

  async handleCorruptedFile() {
    // Backup corrupted file
    // Load most recent valid snapshot
    // Replay valid AOF entries
  }
}
