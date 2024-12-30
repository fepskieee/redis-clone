import { describe, test, expect, vi, beforeEach, afterEach } from "vitest"
import net from "net"
import { setClient, deleteClient } from "../src/config/clients.mjs"
import { logger } from "../src/config/logger.mjs"
import { getCurrentFilename } from "../src/utils/helpers.mjs"

vi.mock("./src/config/clients.mjs")
vi.mock("./src/config/logger.mjs")
vi.mock("./src/utils/helpers.mjs")

describe("Redis Server", () => {
  let server
  let client

  beforeEach(() => {
    server = net.createServer()
    server.listen(6379, "127.0.0.1")
    client = new net.Socket()
  })

  afterEach(() => {
    server.close()
    client.destroy()
    vi.clearAllMocks()
  })

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

    client.connect(6379, "127.0.0.1", () => {
      client.write("PING\r\n")
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
