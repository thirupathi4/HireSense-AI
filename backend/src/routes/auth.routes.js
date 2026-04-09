const { Router } = require("express")

const authRouter = Router()
const authController = require("../controllers/auth.controller")
const { verifyToken } = require("../middleware/auth.middleware")

authRouter.post("/register", authController.registerUserController)
authRouter.post("/login", authController.loginUserController)
authRouter.get("/logout", authController.logoutUserController)
authRouter.get("/get-me", verifyToken, authController.getMeController)


module.exports = authRouter