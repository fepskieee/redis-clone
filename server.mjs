import express from "express"

const app = express()

app.use(express.json())

app.get("/", (req, res) => {
  res.send("hello world")
})

app.listen(6379, () => console.log("listening on 6379"))
