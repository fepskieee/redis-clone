import { JSONPath } from "jsonpath-plus"
import { jp } from "./helpers.mjs"
const { query } = jp

export const _pathExists = (path, json) => {
  try {
    const result = JSONPath({ path, json })
    return result.length > 0
  } catch (error) {
    return false
  }
}

export const _setValueAtPath = (json, path, value) => {
  jp.value(json, path, value)
  return json
}

export const _getValueAtPath = (json, paths) => {
  if (paths.length === 1) return jp.query(json, paths[0])

  const results = paths.map((path) => {
    path = path[0] === "$" ? path : `$${path}`
    return jp.query(json, path)
  })

  return results
}
