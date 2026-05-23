import accountModel from "../model/account.model.js";
import mongoose from "mongoose";
import transactionModel from "../model/transaction.model.js";
import ledgerModel from "../model/ledger.model.js";
import {
  sendTransactionEmail,
  sendTransactionFailureEmail,
} from "../services/email.service.js";

export async function createTransactionController(req, res) {
  /**
   * 1. Validate request body
   */
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message:
        "Missing required fields: fromAccount, toAccount, amount, idempotencyKey",
    });
  }
  const fromUserAccount = await accountModel.findById(fromAccount);
  const toUserAccount = await accountModel.findById(toAccount);
  if (!toUserAccount || !fromUserAccount) {
    return res.status(404).json({
      message: "One or both accounts not found",
    });
  }

  /**
   * 2. validate idempotency key
   */
  const isExistingTransaction = await transactionModel.findOne({
    idempotencyKey,
  });
  if (isExistingTransaction) {
    if (isExistingTransaction.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already completed",
        transaction: isExistingTransaction,
      });
    }
    if (isExistingTransaction.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction is still pending",
      });
    }
    if (isExistingTransaction.status === "FAILED") {
      return res.status(500).json({
        message: "Transaction has failed",
      });
    }
    if (isExistingTransaction.status === "REVERSED") {
      return res.status(500).json({
        message: "Transaction has been reversed",
      });
    }
  }
  /**
   * 3. Check account status
   */
  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      message:
        "One or both accounts are need to be active to perform transaction",
    });
  }
  /**
   * 4. Derieve sender balance from ledger
   */
  const balance = await fromUserAccount.getBalance();
  if (balance < amount) {
    return res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance}. Required balance is ${amount}`,
    });
  }
  /**
   * 5. Create transaction with pending status
   */
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await transactionModel.create(
    {
      fromAccount,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING",
    },
    { session },
  );
  /**
   * 5. Create Credit ledger entry.
   */


  const creditLedgerEntry = new ledgerModel([
    {
      account: toAccount,
      type: "CREDIT",
      amount: amount,
      transaction: transaction._id,
    },],
    { session },
  );
  /**
   * 6. Create Debit ledger entry.
   */

  await new Promise((resolve) => setTimeout(resolve, 100));
  const debitLedgerEntry = new ledgerModel([
    {
      account: fromAccount,
      type: "DEBIT",
      amount: amount,
      transaction: transaction._id,
    },],
    { session },
  );

  /**
   * 7. Update transaction status to completed
   */
  transaction.status = "COMPLETED";
  await transaction.save({ session });
  /**
   * 8. Commit transaction
   */
  await session.commitTransaction();
  session.endSession();
  return res.status(201).json({
    message: "Transaction completed successfully",
    transaction,
  });

  /**
   * 9. Send Email notification.
   */
  await sendTransactionEmail(fromUserAccount.user, toUserAccount.user, amount);
  return res.status(201).json({
    message: "Transaction completed successfully",
    transaction,
  });
}

export async function createInitialFundsTransactionController(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;
  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "Missing required fields: toAccount, amount, idempotencyKey",
    });
  }
  const toUserAccount = await accountModel.findById(toAccount);
  if (!toUserAccount) {
    return res.status(404).json({
      message: "Account not found",
    });
  }
  const fromUserAccount = await accountModel.findOne({
    // systemUser: true,
    user: req.user._id,
  });
  if (!fromUserAccount) {
    return res.status(500).json({
      message: "System user account not found",
    });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = new transactionModel({
    fromAccount: fromUserAccount._id,
    toAccount: toUserAccount._id,
    amount,
    idempotencyKey,
    status: "PENDING",
  });
  // save transaction within session
  await transaction.save({ session });
  const debitLedgerEntry = await ledgerModel.create([
    {
      account: fromUserAccount._id,
      type: "DEBIT",
      amount: amount,
      transaction: transaction._id,
    },],
    { session },
  );
  const creditLedgerEntry = await ledgerModel.create([
    {
      account: toUserAccount._id,
      type: "CREDIT",
      amount: amount,
      transaction: transaction._id,
    },],
    { session },
  );
  transaction.status = "COMPLETED";
  await transaction.save({ session });
  await session.commitTransaction();
  session.endSession();
  return res.status(201).json({
    message: "Initial funds transaction completed successfully",
    transaction,
  });
}
