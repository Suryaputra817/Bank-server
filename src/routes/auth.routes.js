import express from "express";
import { userLogin, userRegister,verifyEmail } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/register", userRegister);
authRouter.post("/login", userLogin);
authRouter.get("/verify-email", verifyEmail);

export default authRouter;
