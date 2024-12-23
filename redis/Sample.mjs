import net from "net"
import { input } from "./libs/stdio.mjs"

class SimpleRedisClient {
  constructor(host = "127.0.0.1", port = 6379) {
    this.host = host
    this.port = port
    this.socket = null
    this.responseBuffer = ""
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = net.createConnection(
        { host: this.host, port: this.port },
        () => {
          console.log(`Connected to Redis server at ${this.host}:${this.port}`)
          resolve()
        }
      )

      this.socket.on("data", (data) => {
        this.responseBuffer += data.toString()
        console.log(`Received: ${this.responseBuffer}`)
        this.responseBuffer = ""
      })

      this.socket.on("error", (err) => {
        console.error(`Error: ${err.message}`)
        reject(err)
      })

      this.socket.on("close", () => {
        console.log("Connection closed.")
      })
    })
  }

  // sendCommand(command, ...args) {
  //   return new Promise((resolve, reject) => {
  //     const respCommand = this._constructRespCommand(command, args)
  //     this.socket.write(respCommand)

  //     this.socket.once("data", (data) => {
  //       resolve(this._parseResp(data.toString()))
  //     })

  //     this.socket.on("error", (err) => {
  //       reject(err)
  //     })
  //   })
  // }

  // _constructRespCommand(command, args) {
  //   const parts = [command, ...args]
  //   const respArray = [`*${parts.length}`]
  //   parts.forEach((part) => {
  //     respArray.push(`$${part.length}`)
  //     respArray.push(part)
  //   })
  //   return respArray.join("\r\n") + "\r\n"
  // }

  // _parseResp(data) {
  //   const firstChar = data[0]
  //   if (firstChar === "+") {
  //     return data.slice(1, -2)
  //   } else if (firstChar === "-") {
  //     throw new Error(data.slice(1, -2))
  //   } else if (firstChar === ":") {
  //     return parseInt(data.slice(1, -2), 10)
  //   } else if (firstChar === "$") {
  //     const length = parseInt(data.slice(1, data.indexOf("\r\n")), 10)
  //     if (length === -1) return null
  //     return data.slice(data.indexOf("\r\n") + 2, -2)
  //   } else if (firstChar === "*") {
  //     // Array reply
  //     const lines = data.split("\r\n")
  //     const length = parseInt(lines[0].slice(1), 10)
  //     if (length === -1) return null // Null array
  //     const result = []
  //     for (let i = 1; i < lines.length - 1; i += 2) {
  //       result.push(lines[i + 1])
  //     }
  //     return result
  //   } else {
  //     throw new Error("Unknown response format")
  //   }
  // }

  disconnect() {
    if (this.socket) {
      this.socket.end()
      console.log("Disconnected from Redis server.")
    }
  }
}

// Example usage
;(async () => {
  const client = new SimpleRedisClient()
  await client.connect()

  try {
    console.log("Sending command...")
    await input("Enter command: ")
  } catch (err) {
    console.error(err.message)
  }
})()
