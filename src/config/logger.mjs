import pino from "pino"
import { getServerTimestamp } from "../utils/helpers.mjs"

const createLogger = (namespace) => {
  return pino({
    name: namespace,
    base: { pid: undefined },
    timestamp: () => `,"time":"${getServerTimestamp()}"`,
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

export const logWithLine = (message) => {
  const error = new Error()
  const stack = error.stack.split("\n")
  const lineNumber = stack[2].match(/:(\d+):\d+/)
  console.log(
    `(Line: ${lineNumber ? lineNumber[1] : "unknown"}) ${JSON.stringify(
      message
    )}`
  )
}

export default createLogger
