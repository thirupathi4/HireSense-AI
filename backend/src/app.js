const express = require("express");
const cookieParser = require("cookie-parser")
const cors = require("cors")



const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}
))

const authRouter = require("./routes/auth.routes")
const router = require("./routes/report.routes")

app.use("/api/auth", authRouter)
app.use("/api/report", router)



module.exports = app