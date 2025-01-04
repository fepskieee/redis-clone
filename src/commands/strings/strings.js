import nesp from "../../utils/nesp.js"
import {
  ERR_MSG_SYNTAX_ERROR,
  ERR_MSG_WRONG_NUMBER_ARGS,
} from "../../utils/constants/generic-messages.js"

export const get = (key) => {
  if (isArguments.length > 1) {
    return nesp.simpleError(ERR_MSG_SYNTAX_ERROR)
  }

  if (!key) {
    return nesp.simpleError(ERR_MSG_WRONG_NUMBER_ARGS)
  }

  if (true) {
  }
}
export const set = (key, value, options = {}) => {}
export const mget = (keys) => {}
export const incr = (key) => {}
export const incrby = (key, increment) => {}
export const incrbyfloat = (key, increment) => {}

export default strings = {
  GET: get,
  SET: set,
  INCR: incr,
  INCRBY: incrby,
  INCRBYFLOAT: incrbyfloat,
}
