import net from "net"
import { logger, logWithLine } from "./src/config/logger.mjs"
import { setClient, deleteClient, getClientMap } from "./src/config/clients.mjs"
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
  const totalClient = getClientMap().size
  serverLogger.info(`[${totalClient}] New client connected ${clientInfo.id}`)

  socket.on("data", (data) => {
    const buffer = data.toString()

    serverLogger.info(`${buffer}`)

    const [cmd] = buffer.trim().split(" ")

    socket.write("+PONG")
  })

  socket.on("end", () => {
    serverLogger.info(`${clientInfo.id} finished sending data...`)
  })

  socket.on("close", () => {
    serverLogger.info(`Client disconnected ${clientInfo.id}`)
    deleteClient(clientInfo.id)
    const totalClient = getClientMap().size
    serverLogger.info(`Total client connected: ${totalClient}`)
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

server.listen(port, host, () => {
  serverLogger.info(`Nedis server is listening on ${host}:${port}`)
})
