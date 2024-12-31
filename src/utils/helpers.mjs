import path from "path"
import { fileURLToPath } from "url"

export const getServerTimestamp = () => new Date().toISOString()

export const getCurrentFilename = (url) => {
  const __filename = fileURLToPath(url)

  return path.basename(__filename, path.extname(__filename))
}

export const getIPv4 = (address) => {
  return address.startsWith("::ffff:") || address.startsWith("::1:")
    ? address.slice(7)
    : address
}

export const isEmptyObject = (obj) => {
  return Object.entries(obj).length === 0 && obj.constructor === Object
}
