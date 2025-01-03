import subscribers from "../../models/subscribers.mjs"
import channels from "../../models/channels.mjs"

export default class PubSub {
  static SUBSCRIBE(args, type, socket) {
    const [topic] = args

    socket.isInSubscribeMode = true
    socket.isPubSubClient = true
    socket.subscribedCount = (socket.subscribedCount || 0) + 1

    if (!subscribers.has(topic)) {
      subscribers.set(topic, new Set())
    }
    subscribers.get(topic).add(socket)

    if (!channels.has(socket)) {
      channels.set(socket, new Set())
    }
    channels.get(socket).add(topic)

    socket.write(
      `*3\r\n$9\r\nsubscribe\r\n$${topic.length}\r\n${topic}\r\n:${
        subscribers.get(topic).size
      }\r\n`
    )

    return null
  }

  static PUBLISH(args, type, socket) {
    const [topic, message] = args
    const connectedSubscribers = subscribers.get(topic)

    if (!connectedSubscribers || connectedSubscribers.size === 0) {
      return `:0\r\n`
    }

    connectedSubscribers.forEach((subscriber) => {
      if (subscriber.writable && subscriber.isPubSubClient) {
        subscriber.write(
          `*3\r\n$7\r\nmessage\r\n$${topic.length}\r\n${topic}\r\n$${message.length}\r\n${message}\r\n`
        )
      }
    })

    return `:${connectedSubscribers.size}\r\n`
  }

  static UNSUBSCRIBE(args, type, socket) {
    const [topic] = args

    if (subscribers.has(topic)) {
      subscribers.get(topic).delete(socket)
    }

    if (channels.has(socket)) {
      channels.get(socket).delete(topic)
    }

    socket.subscribedCount = Math.max(0, (socket.subscribedCount || 1) - 1)

    if (socket.subscribedCount === 0) {
      socket.isInSubscribeMode = false
      socket.isPubSubClient = false
    }

    return `*3\r\n$11\r\nunsubscribe\r\n$${topic.length}\r\n${topic}\r\n:${socket.subscribedCount}\r\n`
  }

  static handleDisconnect(socket) {
    if (channels.has(socket)) {
      const topics = channels.get(socket)
      topics.forEach((channel) => {
        if (subscribers.has(channel)) {
          subscribers.get(channel).delete(socket)
        }
      })
      topics.delete(socket)
    }
    socket.isInSubscribeMode = false
    socket.isPubSubClient = false
  }
}
