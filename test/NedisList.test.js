import NedisList from "../redis/NedisList.mjs"

describe("NedisList", () => {
  let nedisList
  let mockDataStore
  let mockExpirationTimers

  beforeEach(() => {
    mockDataStore = new Map()
    mockExpirationTimers = new Map()
    nedisList = new NedisList(mockDataStore, mockExpirationTimers)
  })

  describe("constructor", () => {
    test("test: should initialize with dataStore and expirationTimers", () => {
      expect(nedisList.dataStore).toBe(mockDataStore)
      expect(nedisList.expirationTimers).toBe(mockExpirationTimers)
    })
  })

  describe("lpush", () => {
    test("should add elements to the start of the list", () => {
      nedisList.lpush(["testKey", ["value1", "value2"]])
      expect(mockDataStore.get("testKey")).toEqual(["value1", "value2"])
    })
  })

  describe("rpush", () => {
    test("should add elements to the end of the list", () => {
      const result = nedisList.rpush("testKey", "value1", "value2")
      expect(mockDataStore["testKey"]).toEqual(["value1", "value2"])
      expect(result).toBe(2)
    })
  })

  describe("lpop", () => {
    test("should remove and return the first element", () => {
      mockDataStore["testKey"] = ["value1", "value2"]
      const result = nedisList.lpop("testKey")
      expect(result).toBe("value1")
      expect(mockDataStore["testKey"]).toEqual(["value2"])
    })

    test("should return null for non-existent key", () => {
      expect(nedisList.lpop("nonexistentKey")).toBeNull()
    })
  })

  describe("rpop", () => {
    test("should remove and return the last element", () => {
      mockDataStore["testKey"] = ["value1", "value2"]
      const result = nedisList.rpop("testKey")
      expect(result).toBe("value2")
    })
  })
})

