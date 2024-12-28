import pino from "pino"
import { getServerTimestamp } from "../utils/helpers.mjs"

const createLogger = (namespace) => {
  return pino({
    name: namespace,
    base: { pid: undefined },
    timestamp: () => `,"time":"${getServerTimestamp}"`,
    transport: {
      targets: [
        { target: "pino-pretty" },
        { target: "pino/file", options: { destination: "server.log" } },
      ],
    },
  })
}

export const log = {
  info: (namespace, ...args) => createLogger(namespace).info(...args),
  error: (namespace, ...args) => createLogger(namespace).error(...args),
  warn: (namespace, ...args) => createLogger(namespace).warn(...args),
  debug: (namespace, ...args) => createLogger(namespace).debug(...args),
}

export default createLogger
