import express from "express";
import { userLoginController, userRegisterController,verifyEmailController,userLogoutController } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/register", userRegisterController);
authRouter.post("/login", userLoginController);
authRouter.get("/verify-email", verifyEmailController);
authRouter.post("/logout", userLogoutController);

export default authRouter;
