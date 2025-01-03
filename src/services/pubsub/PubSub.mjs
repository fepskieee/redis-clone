import subscribersMap from "../../models/subscribers.mjs"
import channelsMap from "../../models/subscribers.mjs"

export default class PubSub {
  static SUBSCRIBE(args, type, socket) {
    const [channel] = args

    if (!subscribersMap.has(channel)) {
      subscribersMap.set(channel, new Set())
    }
    subscribersMap.get(channel).add(socket)

    if (!channelsMap.has(socket)) {
      channelsMap.set(socket, new Set())
    }
    channelsMap.get(socket).add(channel)

    return `+Subscribed to ${channel}\r\n`
  }

  static PUBLISH(args, type, socket) {
    console.log("publish")
    const [channel, message] = args
    const subscribers = subscribersMap.get(channel)

    if (!subscribers) {
      return `:0\r\n`
    }

    subscribers.forEach((socket) => {
      socket.write(
        `*3\r\n$7\r\nmessage\r\n$${channel.length}\r\n${channel}\r\n$${message.length}\r\n${message}\r\n`
      )
    })

    return `:${subscribers.size}\r\n`
  }

  static UNSUBSCRIBE(args, type, socket) {
    const [channel] = args

    if (subscribersMap.has(channel)) {
      subscribersMap.get(channel).delete(socket)
    }

    if (channelsMap.has(socket)) {
      channelsMap.get(socket).delete(channel)
    }

    return `+Unsubscribed from ${channel}\r\n`
  }

  static handleDisconnect(socket) {
    if (channelsMap.has(socket)) {
      const channels = channelsMap.get(socket)
      channels.forEach((channel) => {
        if (subscribersMap.has(channel)) {
          subscribersMap.get(channel).delete(socket)
        }
      })
      channels.delete(socket)
    }
  }
}
