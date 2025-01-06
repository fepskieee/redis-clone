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
  const pathSegments = path.split(".").filter(Boolean)
  let current = json

  if (pathSegments.length === 1 && pathSegments[0] === "$") {
    current = value

    return current
  }

  pathSegments.forEach((key, index) => {
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = {}
    }
    current = current[key]
  })

  const lastSegment = pathSegments[pathSegments.length - 1]
  current[lastSegment] = value

  return current
}
