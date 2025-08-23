const { creditWallet, debitWallet } = require('../services/walletService');

const deposit = async (req, res) => {
  const { crypto, amount } = req.body;
  try {
    const wallet = await creditWallet(req.user.userId, crypto, amount);
    res.json({ message: "Deposit successful", wallet });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const withdraw = async (req, res) => {
  const { crypto, amount } = req.body;
  try {
    const wallet = await debitWallet(req.user.userId, crypto, amount);
    res.json({ message: "Withdrawal request submitted", wallet });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { deposit, withdraw };
