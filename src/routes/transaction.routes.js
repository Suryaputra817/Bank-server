import { Router } from "express";
import {
  authMiddleware,
  systemUserAuthMiddleware,
} from "../middleware/auth.middleware.js";
import {
  createTransactionController,
  createInitialFundsTransactionController,
} from "../controllers/transaction.controller.js";

const transactionRouter = Router();

transactionRouter.post("/", authMiddleware, createTransactionController);

transactionRouter.post("/system/initial-funds", systemUserAuthMiddleware, createInitialFundsTransactionController);

export default transactionRouter;
