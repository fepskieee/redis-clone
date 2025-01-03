import { subscribers } from "../../models/subscribers.mjs"
import { channels } from "../../models/subscribers.mjs"

export default class PubSub {
  static SUBSCRIBE(args, type, socket) {
    const [channel] = args

    if (!subscribers.has(channel)) {
      subscribers.set(channel, new Set())
    }
    subscribers.get(channel).add(socket)

    if (!channels.has(socket)) {
      channels.set(socket, new Set())
    }
    channels.get(socket).add(channel)

    return `+Subscribed to ${channel}\r\n`
  }

  static PUBLISH(args) {
    const [channel, message] = args
    const subs = subs.get(channel)

    if (!subs) {
      return `:0\r\n`
    }

    subs.forEach((socket) => {
      socket.write(
        `*3\r\n$7\r\nmessage\r\n$${channel.length}\r\n${channel}\r\n$${message.length}\r\n${message}\r\n`
      )
    })

    return `:${subs.size}\r\n`
  }

  static UNSUBSCRIBE(args, type, socket) {
    const [channel] = args

    if (subscribers.has(channel)) {
      subscribers.get(channel).delete(socket)
    }

    if (channels.has(socket)) {
      channels.get(socket).delete(channel)
    }

    return `+Unsubscribed from ${channel}\r\n`
  }

  static handleDisconnect(socket) {
    if (channels.has(socket)) {
      const channels = this.channels.get(socket)
      channels.forEach((channel) => {
        if (subscribers.has(channel)) {
          subscribers.get(channel).delete(socket)
        }
      })
      channels.delete(socket)
    }
  }
}
