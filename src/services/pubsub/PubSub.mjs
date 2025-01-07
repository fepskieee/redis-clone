import { EventEmitter } from "events"
import { subscriberMap } from "../../models/dataStore.mjs"
import channels from "../../models/channels.mjs"

export default class PubSub extends EventEmitter {
  static emitter = new EventEmitter()
  constructor() {
    super()
  }

  static SUBSCRIBE(args, type, socket) {
    const [topic] = args

    if (!subscriberMap.has(topic)) {
      subscriberMap.set(topic, new Set())
    }
    subscriberMap.get(topic).add(socket)

    if (!channels.has(socket)) {
      channels.set(socket, new Set())
    }
    channels.get(socket).add(topic)

    return `*3\r\n$9\r\nsubscribe\r\n$${topic.length}\r\n${topic}\r\n:${
      channels.get(socket).size
    }\r\n`
  }

  static PUBLISH(args, type, socket) {
    const [topic, message] = args
    const subscribers = subscriberMap.get(topic)

    if (!subscribers || subscribers.size === 0) {
      return `:0\r\n`
    }

    subscribers.forEach((subscriber) => {
      subscriber.write(
        `*3\r\n$7\r\nmessage\r\n$${topic.length}\r\n${topic}\r\n$${message.length}\r\n${message}\r\n`
      )
    })

    return `:${subscribers.size}\r\n`
  }

  static UNSUBSCRIBE(args, type, socket) {
    const [topic] = args

    if (subscriberMap.has(topic)) {
      subscriberMap.get(topic).delete(socket)
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
        if (subscriberMap.has(channel)) {
          subscriberMap.get(channel).delete(socket)
        }
      })
      topics.delete(socket)
    }
    socket.isInSubscribeMode = false
    socket.isPubSubClient = false
  }
}
