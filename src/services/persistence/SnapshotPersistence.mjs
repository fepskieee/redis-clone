import fs from "fs/promises"
import {fileURLToPath} from "url"
import path, {dirname} from "path"
import config from "../../configs/config.json" with { type: "json" }
import { logger } from "../../configs/logger.mjs"
import store from "../../models/store.mjs"
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
    this.dataDir = path.join(process.cwd(), config.directory || dir || this.DIRECTORY)
    this.snapshotFilename = path.join(process.cwd(), config.snapshotFilename || snapshotFilename || this.SNAPSHOT_FILENAME)
    this.db = path.resolve(this.dataDir, config.snapshotFilename) || this.DB_DEFAULT_FILE
  }

  static async initialize(dir, aofFilename) {
    const instance = new SnapshotPersistence(dir, aofFilename)
    await instance.ensureDataDir()
    return instance
  }

  async ensureDataDir() {
    try {
      await fs.access(this.dataDir)
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true })
    }
  }

  async save(data) {
    try {
      const serializedData = JSON.stringify(data, null, 2)
      await fs.writeFile(this.db, serializedData, { flag: 'w', flush: true })

      const stats = await fs.stat(this.db)
      if (stats.size > 0) {
        snapshotLogger.info('Snapshot saved successfully')
        return
      }
      throw new Error("Write to disk failed...")
    } catch (err) {
      snapshotLogger.error(`Failed saving: ${err.message}`)
    }
  }

  async load() {
    try {
      const data = await fs.readFile(this.db, "utf-8")

      const {storeMap} = JSON.parse(data)
      if (!storeMap) {
        throw new Error("Invalid snapshot structure")
      }
      
      const storeSnapshot = storeMap && Object.keys(storeMap).length > 0 
      ? new Map(Object.entries(storeMap)) 
      : new Map()
      
      snapshotLogger.info("Snapshot loaded successfully...")
      store.setStoreMap(storeSnapshot)
    } catch (err) {
      if (err.code === "ENOENT") {
        snapshotLogger.info("Snapshot file not found. Creating a new one...")
      }

      snapshotLogger.error(`Failed to load snapshot: ${err.message}`)
    }
  }
}
