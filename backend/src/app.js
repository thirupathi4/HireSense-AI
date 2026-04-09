const express = require("express");
const cookieParser = require("cookie-parser")
const cors = require("cors")


const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors())

const authRouter = require("./routes/auth.routes")

app.use("/api/auth", authRouter)



module.exports = app