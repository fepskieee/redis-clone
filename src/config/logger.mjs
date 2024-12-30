import pino from "pino"
import { getServerTimestamp } from "../utils/helpers.mjs"

export const logger = (namespace) => {
  const createPino = pino({
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

  return {
    info: (...msg) => createPino.info(...msg),
    error: (...msg) => createPino.error(...msg),
    warn: (...msg) => createPino.warn(...msg),
    debug: (...msg) => createPino.debug(...msg),
  }
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
