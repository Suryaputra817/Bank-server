import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createTransaction } from "../controllers/transaction.controller.js";

const transactionRouter = Router();
transactionRouter.post("/", authMiddleware, createTransaction);

export default transactionRouter;
