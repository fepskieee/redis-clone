import net from "net"

import { log, logWithLine } from "./src/config/logger.mjs"
import { setClient, deleteClient } from "./src/config/clients.mjs"
import { getFilename } from "./src/utils/helpers.mjs"

const server = net.createServer()
const host = process.env.HOST || "127.0.0.1"
const port = process.env.PORT || 6379

const namespace = getFilename(import.meta.url)

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

  log.info(namespace, `New client connected ${clientInfo.id}`)
  setClient(clientInfo.id, clientInfo)
  socket.write(`${serverInfo.id}> `)

  let buffer = ""

  socket.on("data", (data) => {
    buffer += data.toString()

    const [cmd, args] = buffer.trim().split(" ")
    logWithLine(cmd)

    let response = ""
    switch (cmd.toUpperCase()) {
      case "SET":
        response = "OK\r\n"
        break
      default:
        response = "ERR unknown command\r\n"
    }

    buffer = ""
    socket.write(`${serverInfo.id}> `)
  })

  socket.on("end", () => {
    log.info(namespace, `Socket connection ends ${clientInfo.id}`)

    socket.end()
  })

  socket.on("close", () => {
    log.info(namespace, `Socket connection closing ${clientInfo.id}`)
    deleteClient(clientInfo.id)
  })

  socket.on("error", (err) => {
    switch (err.code) {
      case "ECONNRESET":
        log.error(
          namespace,
          `Client disconnected ${clientInfo.id} [${err.code}] `
        )
        break
      default:
        log.error(namespace, err, err.message)
    }
  })
})

server.on("error", (err) => {
  log.error(namespace, err, err.message)
})

server.listen(port, host, () =>
  log.info(namespace, `Nedis server is listening on ${host}:${port}`)
)
