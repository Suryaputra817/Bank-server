import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createAccountController,
  getUserAccountsController,
  getAccountBalanceController,
} from "../controllers/account.controller.js";

const accountRouter = express.Router();
accountRouter.post("/", authMiddleware, createAccountController);
accountRouter.get("/", authMiddleware, getUserAccountsController);
accountRouter.get("/balance/:accountId", authMiddleware, getAccountBalanceController);

export default accountRouter;
