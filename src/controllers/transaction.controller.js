import accountModel from "../model/account.model.js";

export async function createTransaction(req, res) {
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
      message: "One or both accounts are need to be active to perform transaction",
    });
  }
  /**
   * 4. Derieve sender balance from ledger
   */
  
}
