import net from "net"
import { logger } from "./src/configs/logger.mjs"
import { setClient, deleteClient, getClientMap } from "./src/models/clients.mjs"
import { nedis } from "./src/services/nedis.mjs"
import { getCurrentFilename } from "./src/utils/helpers.mjs"

const server = net.createServer()
const host = process.env.HOST || "127.0.0.1"
const port = process.env.PORT || 6379

const namespace = getCurrentFilename(import.meta.url)
const serverLogger = logger(namespace)

server.on("connection", (socket) => {
  const { remoteAddress, remotePort, remoteFamily } = socket

  const clientInfo = {
    id: `${remoteAddress}:${remotePort}`,
    ip: remoteAddress,
    port: remotePort,
    family: remoteFamily,
  }

  setClient(clientInfo.id, clientInfo)
  serverLogger.info(`New client connected ${clientInfo.id}`)

  const totalClient = getClientMap()
  serverLogger.info(`Total client currently connected: ${totalClient.size}`)

  socket.on("data", (data) => {
    const bufferData = data.toString()
    const result = nedis.parseCommand(bufferData)
    socket.write(result)
  })

  socket.on("end", () => {
    serverLogger.info(`${clientInfo.id} finished sending data...`)
  })

  socket.on("close", () => {
    serverLogger.info(`Client disconnected ${clientInfo.id}`)
    deleteClient(clientInfo.id)

    const totalClient = getClientMap()
    serverLogger.info(`Total client currently connected: ${totalClient.size}`)
  })

  socket.on("error", (err) => {
    switch (err.code) {
      case "ECONNRESET":
        serverLogger.error(`An error occured on client side (${err.code})`)
        break

      default:
        serverLogger.error(err)
        break
    }
  })
})

server.on("error", (err) => {
  serverLogger.error(err, err.message)
})

server.listen(port, host, () => {
  serverLogger.info(`Nedis server is listening on ${host}:${port}`)
})
