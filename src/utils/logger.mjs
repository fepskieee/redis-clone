import pino from "pino"

const logger = pino({
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  transport: {
    targets: [
      { target: "pino-pretty" },
      { target: "pino/file", options: { destination: "server.log" } },
    ],
  },
})

export const log = {
  info: (message) => logger.info(message),
  error: (message) => logger.error(message),
  warn: (message) => logger.warn(message),
  debug: (message) => logger.debug(message),
}

export default logger
