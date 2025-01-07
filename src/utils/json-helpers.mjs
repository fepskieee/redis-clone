import { JSONPath } from "jsonpath-plus"

export const _pathExists = (json, path) => {
  try {
    const result = JSONPath(path, json)
    return result.length > 0
  } catch (error) {
    return false
  }
}

export const _setValueAtPath = (json, path, value) => {
  const pathSegments = path.slice(1).split(".").filter(Boolean)
  let current = json

  if (pathSegments.length === 0) {
    return value
  }

  pathSegments.forEach((segment) => {
    if (!current[segment] || typeof current[segment] !== "object") {
      current[segment] = {}
    }
    current = current[segment]
  })

  const lastSegment = pathSegments[pathSegments.length - 1]
  current[lastSegment] = value

  return JSON.stringify(current)
}
