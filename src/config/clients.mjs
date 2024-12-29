const clientMap = new Map()

export const getClient = (key) => {
  return clientMap.get(key)
}

export const setClient = (key, values) => {
  return clientMap.set(key, values)
}

export const deleteClient = (key) => {
  return clientMap.delete(key)
}

export const getClientMap = () => {
  return new Map(clientMap)
}
