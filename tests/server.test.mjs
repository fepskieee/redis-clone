import { describe, test, expect, vi, beforeEach, afterEach } from "vitest"
import net from "net"
import { setClient, deleteClient } from "../src/config/clients.mjs"

vi.mock("./src/config/clients.mjs")
vi.mock("./src/config/logger.mjs")

const port = 6379
const host = "127.0.0.1"

describe("Nedis Server", () => {
  let client

  beforeEach((done) => {
    client = new net.Socket()
  })

  afterEach(() => {
    client.destroy()
    vi.clearAllMocks()
  })

  test('should respond pong when client sent "ping"', async () => {
    const result = await new Promise((resolve, reject) => {
      client.connect(port, host, () => {
        client.write("PING\r\n")
      })

      client.on("data", (data) => {
        try {
          const response = data.toString()
          resolve(response)
        } catch (error) {
          reject("not OK")
        }
      })

      client.on("error", (err) => {
        reject("Connection failed")
      })

      client.setTimeout(5000, () => {
        reject("Connection timeout")
      })
    })

    console.log(result)
    expect(`${result}`).toEqual("+PONG")
  }, 5000)

  test("should connect client and handle data", (done) => {
    server.on("connection", (socket) => {
      expect(setClient).toHaveBeenCalledWith(
        expect.stringContaining(":"),
        expect.objectContaining({
          id: expect.stringContaining(":"),
          ip: expect.any(String),
          port: expect.any(Number),
          family: expect.any(String),
        })
      )

      socket.on("data", (data) => {
        expect(data.toString()).toBe("PING\r\n")
        done()
      })
    })
  })

  test("should handle client disconnect", (done) => {
    server.on("connection", (socket) => {
      socket.on("close", () => {
        expect(deleteClient).toHaveBeenCalledWith(expect.stringContaining(":"))
        done()
      })
    })

    client.connect(6379, "127.0.0.1", () => {
      client.end()
    })
  })

  test("should handle server errors", () => {
    const mockLogger = {
      error: vi.fn(),
    }
    logger.mockReturnValue(mockLogger)

    server.emit("error", new Error("test error"))
    expect(mockLogger.error).toHaveBeenCalled()
  })
})
