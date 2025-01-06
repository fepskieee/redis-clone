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

  if (pathSegments.length === 1 && pathSegments[0] === "$") {
    return { ...json, ...value }
  }

  let current = json
  pathSegments.forEach((key, index) => {
    if (index === pathSegments.length - 1) {
      current[key] = { ...current[key], ...value }
    } else {
      if (!current[key] || typeof current[key] !== "object") {
        current[key] = {}
      }
      current = current[key]
    }
  })

  return json
}
