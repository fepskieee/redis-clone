import { logger } from "../configs/logger.mjs"
import store from "../models/store.mjs"
import timer from "../models/timer.mjs"
import { getCurrentFilename } from "../utils/helpers.mjs"

const namespace = getCurrentFilename(import.meta.url)
const stringsLogger = logger(namespace)

class Lists {}

export default Lists
