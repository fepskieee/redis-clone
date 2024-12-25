import NedisList from "../redis/NedisList.mjs"
import Nedis from "../redis/Nedis.mjs"

describe("NedisList", () => {
  let nedis
  let dataStore
  let expirationTimers
  let nedisList
  const key1 = "bikes:repairs"
  const key2 = "bikes:repairs2"

  const numArr1 = [1, 2, 3]
  const numArr2 = [4, 5, 6]

  const strArr1 = ["bike:1", "bike:2", "bike:3"]
  const strArr2 = ["bike:4", "bike:5", "bike:6"]

  beforeEach(() => {
    nedis = new Nedis()
    dataStore = nedis.dataStore
    expirationTimers = nedis.expirationTimers
    nedisList = new NedisList(nedis.dataStore, nedis.expirationTimers)
  })

  describe("constructor", () => {
    test("should initialize with dataStore and expirationTimers", () => {
      expect(nedisList.dataStore).toBe(dataStore)
      expect(nedisList.expirationTimers).toBe(nedis.expirationTimers)
    })
  })

  describe("lpush", () => {
    test("should add elements to the start of the list", () => {
      nedisList.lpush([key1, strArr1])

      expect(nedisList.dataStore.get(key1)).toEqual(strArr1)
    })
  })

  describe("rpush", () => {
    test("should add elements to the end of the list", () => {
      const result = nedisList.rpush("testKey", "value1", "value2")
      expect(dataStore["testKey"]).toEqual(["value1", "value2"])
      expect(result).toBe(2)
    })
  })

  describe("lpop", () => {
    test("should remove and return the first element", () => {
      dataStore["testKey"] = ["value1", "value2"]
      const result = nedisList.lpop("testKey")
      expect(result).toBe("value1")
      expect(dataStore["testKey"]).toEqual(["value2"])
    })

    test("should return null for non-existent key", () => {
      expect(nedisList.lpop("nonexistentKey")).toBeNull()
    })
  })

  describe("rpop", () => {
    test("should remove and return the last element", () => {
      dataStore["testKey"] = ["value1", "value2"]
      const result = nedisList.rpop("testKey")
      expect(result).toBe("value2")
    })
  })
})

