const reply = {
  simpleString: (strings = "OK") => `+${strings}\r\n`,
  simpleError: (strings = "ERR") => `-${strings}\r\n`,
  integer: (integer) => `:${integer}\r\n`,
  bulkString: (strings) => {
    return `${!strings ? `$-1\r\n` : `$${strings.length}\r\n${strings}\r\n`}`
  },
  null: () => `_\r\n`,
  boolean: (boolean) => `#${boolean ? "t" : "f"}\r\n`,
  double: (double) => `,${double}\r\n`,
  array: (array) => {
    return `${array.reduce(
      (accumulator, currentValue) => accumulator + `$${currentValue}\r\n`,
      `*${array.length}\r\n`
    )}`
  },
  multi: (strings = "multi") => `*1\r\n$5\r\n${strings}\r\n`,
  exec: (array) => {
    return `${array.reduce((accumulator, currentValue) => {
      return accumulator + `${currentValue}`
    }, `*${array.length}\r\n`)}`
  },
}

export default reply
