import net from "net"
import { log } from "./src/config/logger.mjs"
import { getIPv4, getFilename } from "./src/utils/helpers.mjs"

const port = process.env.PORT || 6379
const host = process.env.PORT || "127.0.0.1"
const namespace = getFilename(import.meta.url)

const server = net.createServer((socket) => {
  const ipv4 = getIPv4(socket.remoteAddress)
  const clientInfo = {
    ip: ipv4,
    port: socket.port,
    id: `${ipv4}:${port}`,
  }

  log.info(namespace, `Client has connected from ${clientInfo.id}`)
  socket.write(`${clientInfo.id}> `)

  let bufferData = ""
  socket.on("data", (data) => {
    log.info(`receive data: ${data}`)
  })

  socket.on("end", () => {
    log.info(namespace, "Client disconnected")
  })

  socket.on("error", (err) => {
    log.error(namespace, err, "Socket error")
  })
})

server.on("error", (err) => {
  log.error("server error", err)
})

server.listen(port, host, () =>
  log.info(namespace, `Nedis server is listening on ${host}:${port}`)
)
