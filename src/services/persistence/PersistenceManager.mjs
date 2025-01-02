import config from "../../configs/config.json" with { type: "json" }
import store from "../../models/store.mjs"
import AOFPersistence from "./AOFPersistence.mjs"
import SnapshotPersistence from "./SnapshotPersistence.mjs"

export default class PersistenceManager {
  constructor(snapshotIntervalMs = config.snapshotInterval) {
    this.aof = new AOFPersistence()
    this.snapshot = new SnapshotPersistence()
    this.startSnapshotScheduler(snapshotIntervalMs)
  }

  startSnapshotScheduler(intervalMs) {
    setInterval(async () => {
      await this.saveSnapshot()
    }, intervalMs)
  }

  async logCommand(command, args) {
    try {
      await this.aof.append(command, args)
    } catch (err) {
      console.error("Failed to log command:", err)
      
      throw new Error("Persistence error")
    }
  }

  async saveSnapshot() {
    try {
      const dataStore = store.getStoreMap()

      await this.snapshot.save(dataStore)
    } catch (err) {
      console.error("Failed to save snapshot:", err)

      throw new Error("Snapshot error")
    }
  }

  async restore() {
    try {
      const snapshot = await this.snapshot.load()

      if (snapshot) {
        store.restore(snapshot)
      }

      await this.aof.replay()
    } catch (err) {
      console.error("Failed to restore data:", err)
      
      throw new Error("Restore error")
    }
  }

  async handleCorruptedFile() {
    // Backup corrupted file
    // Load most recent valid snapshot
    // Replay valid AOF entries
  }
}
