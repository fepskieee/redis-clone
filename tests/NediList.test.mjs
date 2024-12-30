import NediList from "../redis/NediList.mjs"
import Nedis from "../redis/Nedis.mjs"

describe("NedisList", () => {
  let storeMock
  let timerMock
  let nediList

  const keyBikeMock = "bike:repair"
  const numArr1 = [1, 2, 3]
  const strArrBike = ["bike:1", "bike:2", "bike:3"]

  beforeEach(() => {
    storeMock = new Map()
    timerMock = new Map()
    nediList = new NediList(storeMock, timerMock)
  })

  describe("constructor", async () => {
    test("should initialize with dataStore and expirationTimers", () => {
      expect(nediList.dataStore).toBe(storeMock)
      expect(nediList.expirationTimers).toBe(timerMock)
    })
  })

  describe("lpush", () => {
    test("should throw error for wrong number of arguments", () => {
      const invalidArgs = [null, undefined]

      invalidArgs.forEach((value) => {
        expect(() => nediList.lpush([keyBikeMock, value])).toThrow()
      })
    })

    test("should add elements to the start of the list", () => {
      nediList.lpush([keyBikeMock, [...numArr1]])

      expect(storeMock.get(keyBikeMock).values).toEqual(["1", "2", "3"])

      console.table([...storeMock.get(keyBikeMock).values].reverse())
    })

    test("should return length of array or 0 for empty array", () => {
      const nonEmpty = nediList.lpush([keyBikeMock, numArr1])
      expect(nonEmpty).toBeGreaterThanOrEqual(0)

      const emptyCase = nediList.lpush([keyBikeMock, []])
      expect(emptyCase).toBeGreaterThanOrEqual(0)

      console.table({
        nonEmpty,
        emptyCase,
      })
    })
  })

  describe("lpop", () => {
    test("should remove and return the elements popped", () => {
      storeMock.set(keyBikeMock, { type: "list", values: [...strArrBike] })
      console.log("store:", [...storeMock.get(keyBikeMock).values].reverse())

      const count = 10
      const result = nediList.lpop([keyBikeMock, count])

      for (let index = 0; index < count; index++) {
        if (index < result.length) break
        expect(result[index]).toEqual(strArrBike.toReversed()[index])
      }

      console.log("\npopped elements: ", result)
      console.log("\nstore:", storeMock.get(keyBikeMock).values.toReversed())
    })

    test.todo("should return null for non-existent key", () => {
      expect(nediList.lpop("nonexistentKey")).toBeNull()
    })
  })

  describe.todo("rpush", () => {
    test.todo("should add elements to the end of the list", () => {
      const result = nediList.rpush("testKey", "value1", "value2")
      expect(storeMock.get("testKey").value).toEqual(["value1", "value2"])
      expect(result).toBe(2)
    })
  })

  describe.todo("rpop", () => {
    test("should remove and return the last element", () => {
      storeMock.set("testKey", { value: ["value1", "value2"] })
      const result = nediList.rpop("testKey")
      expect(result).toBe("value2")
    })
  })
})
