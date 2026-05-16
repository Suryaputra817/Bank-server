import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createAccount } from "../controllers/account.controller.js";

const accountRouter = express.Router();
accountRouter.post("/", authMiddleware, createAccount);

export default accountRouter;
