import net from "net"

import { log } from "./src/config/logger.mjs"
import { getIPv4, getFilename } from "./src/utils/helpers.mjs"

const server = net.createServer()
const host = process.env.HOST || "127.0.0.1"
const port = process.env.PORT || 6379

const namespace = getFilename(import.meta.url)

server.on("connection", (socket) => {
  const ipv4 = getIPv4(socket.remoteAddress)

  const clientInfo = {
    ip: ipv4,
    port: socket.port,
    id: `${ipv4}:${port}`,
  }

  log.info(namespace, `Client has connected from ${clientInfo.id}`)

  socket.write(`${clientInfo.id}> `)

  socket.on("data", (data) => {
    const input = data.toString()

    const [cmd, ...args] = input.split(" ")

    let response = ""
    switch (cmd.toUpperCase()) {
      case "SET":
        response = "OK\r\n"
        break
      default:
        response = "ERR unknown command\r\n"
    }
  })

  socket.on("end", () => {
    log.info(namespace, "Client disconnected")
  })

  socket.on("error", (err) => {
    log.error(namespace, err, err.message)
  })
})

server.on("error", (err) => {
  log.error(namespace, err, err.message)
})

server.listen(port, host, () =>
  log.info(namespace, `Nedis server is listening on ${host}:${port}`)
)
