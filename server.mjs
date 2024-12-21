import net from "net"

const server = net.createServer()

server.on("connection", (socket) => {
  console.log("Client connected")

  let reqData = ""

  socket.write(`Nedis> `)
  socket.on("data", (data) => {
    reqData = data.toString().trim()
  })
  console.log(reqData)
})

const PORT = process.env.PORT || 6379
server.listen(PORT, () =>
  console.log(`Nedis server is listening on port ${PORT}`)
)
