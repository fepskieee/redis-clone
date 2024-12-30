import net from "net"
import { logger, logWithLine } from "./src/config/logger.mjs"
import { setClient, deleteClient } from "./src/config/clients.mjs"
import { getCurrentFilename } from "./src/utils/helpers.mjs"

const server = net.createServer()
const host = process.env.HOST || "127.0.0.1"
const port = process.env.PORT || 6379

const namespace = getCurrentFilename(import.meta.url)
const serverLogger = logger(namespace)

server.on("connection", (socket) => {
  const {
    remoteAddress,
    remotePort,
    remoteFamily,
    localAddress,
    localPort,
    localFamily,
  } = socket

  const clientInfo = {
    id: `${remoteAddress}:${remotePort}`,
    ip: remoteAddress,
    port: remotePort,
    family: remoteFamily,
  }

  const serverInfo = {
    id: `${localAddress}:${localPort}`,
    ip: localAddress,
    port: localPort,
    family: localFamily,
  }

  serverLogger.info(`New client connected ${clientInfo.id}`)
  setClient(clientInfo.id, clientInfo)
  socket.write(`${serverInfo.id}> `)

  socket.on("data", (data) => {
    const buffer = data.toString()

    const [cmd, args] = buffer.trim().split(" ")
    logWithLine(cmd, args)

    let response = ""
    switch (cmd.toUpperCase()) {
      case "SET":
        response = "OK\r\n"
        break
      default:
        response = "ERR unknown command\r\n"
    }

    socket.write(`${serverInfo.id}> `)
  })

  socket.on("end", () => {
    serverLogger.info(`${clientInfo.id} finished sending data...`)
  })

  socket.on("close", () => {
    serverLogger.info(`Client disconnected ${clientInfo.id}`)
    deleteClient(clientInfo.id)
  })

  socket.on("error", (err) => {
    serverLogger.error(
      err,
      `Client disconnected ${clientInfo.id} [${err.code}]`
    )
  })
})

server.on("error", (err) => {
  serverLogger.error(err, err.message)
})

server.listen(port, host, () =>
  serverLogger.info(`Nedis server is listening on ${host}:${port}`)
)
