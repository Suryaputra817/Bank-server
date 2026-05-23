import accountModel from "../model/account.model.js";

export async function createAccountController(req, res) {
  const user = req.user;
  const account = await accountModel.create({
    user: user._id,
  });
  if (!account) {
    return res.status(500).json({
      message: "Failed to create account",
    });
  }
  res.status(201).json({
    account,
  });
}

export async function getUserAccountsController(req, res) {
  const user = req.user;
  const accounts = await accountModel.find({ user: user._id });
  res.status(200).json({
    accounts,
  });
}

export async function getAccountBalanceController(req, res) {
  const user = req.user;
  const accountId = req.params.accountId;
  const account = await accountModel.findOne({
    _id: accountId,
    user: user._id,
  });
  if (!account) {
    return res.status(404).json({
      message: "Account not found",
    });
  }
  const balance = await account.getBalance();
  res.status(200).json({
    balance,
    accountId: account._id,
  });
}
