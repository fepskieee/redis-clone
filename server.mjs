import net from "net"
import { logger } from "./src/configs/logger.mjs"
import { parseCommand } from "./src/controllers/nedisController.mjs"
import { setClient, deleteClient, getClientMap } from "./src/models/clients.mjs"
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
  socket.write("+Welcome to Nedis!")

  socket.on("data", (data) => {
    const bufferData = data.toString().trim().split("\r\n")
    const result = parseCommand(bufferData)
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
    serverLogger.error(
      err,
      `Client disconnected ${clientInfo.id} (${err.code})`
    )
  })
})

server.on("error", (err) => {
  serverLogger.error(err, err.message)
})

server.listen(port, host, () => {
  serverLogger.info(`Nedis server is listening on ${host}:${port}`)
})
