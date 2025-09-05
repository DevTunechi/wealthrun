// src/pages/Dashboard.jsx
import SupportCenter from "../components/SupportCenter";
import WalletInfo from "../components/WalletInfo";
import React, { useState, useEffect, useCallback } from "react";
import { logout } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { fetchTransactions } from "../api/transactions";

// Backend API helpers
import { createPayment } from "../api/payments";
import {
  fetchInvestmentSummary,
  requestWithdrawal,
} from "../api/investments";

const coinOptions = ["bitcoin", "ethereum", "tether"];
const coinSymbols = { bitcoin: "BTC", ethereum: "ETH", tether: "USDT" };
const payCurrencyByCoinId = { bitcoin: "btc", ethereum: "eth", tether: "usdt" };
const currencySymbols = { USD: "$", EUR: "€", GBP: "£" };

export default function Dashboard({ user }) {
  const navigate = useNavigate();

  // ---- UI State ----
  const [currency, setCurrency] = useState("USD");
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [coinPrices, setCoinPrices] = useState({});
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [error, setError] = useState("");

  // ---- Stats ----
  const [investedAmount, setInvestedAmount] = useState(0);
  const [dailyProfit, setDailyProfit] = useState(0);
  const [investmentStartDate, setInvestmentStartDate] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showWallet, setShowWallet] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [investmentConfirmed, setInvestmentConfirmed] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawWallet, setWithdrawWallet] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [pendingWithdrawal, setPendingWithdrawal] = useState(false);

  // ---- Fetch Transactions ----
  useEffect(() => {
    if (user?.uid) {
      setLoading(true);
      fetchTransactions(user.uid)
        .then((data) => setTransactions(data))
        .finally(() => setLoading(false));
    }
  }, [user]);

  // ---- Coin Prices ----
  useEffect(() => {
    async function fetchPrices() {
      try {
        const ids = coinOptions.join(",");
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,eur,gbp`
        );
        const data = await res.json();
        setCoinPrices(data);
      } catch {
        setCoinPrices({});
      }
    }
    fetchPrices();
  }, []);

  const getPriceForCoin = (coin) =>
    coinPrices[coin]?.[currency.toLowerCase()] || "N/A";

  const investmentNum = parseFloat(investmentAmount);
  let minInvestment = 100;
  if (!isNaN(investmentNum)) {
    if (investmentNum >= 1000) minInvestment = 1000;
  }

  const handleInvestmentChange = (e) => {
    const val = e.target.value;
    setInvestmentAmount(val);
    if (!val) return setError("");
    const numVal = parseFloat(val);
    if (isNaN(numVal) || numVal < 100) {
      setError("Minimum investment is $100");
    } else if (numVal < minInvestment) {
      setError(`Minimum for this plan is $${minInvestment}`);
    } else {
      setError("");
    }
  };

  const coinPrice = getPriceForCoin(selectedCoin);
  const coinQuantity =
    !isNaN(investmentNum) && coinPrice !== "N/A"
      ? (investmentNum / coinPrice).toFixed(6)
      : null;

  const daysSinceInvestment = investmentStartDate
    ? Math.floor(
        (Date.now() - new Date(investmentStartDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const currentBalance = investedAmount + dailyProfit * daysSinceInvestment;

  const refreshSummaryAndTransactions = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const [summary, txs] = await Promise.all([
        fetchInvestmentSummary(user.uid),
        fetchTransactions(user.uid),
      ]);
      setInvestedAmount(summary?.investedAmount || 0);
      setDailyProfit(summary?.dailyProfit || 0);
      setInvestmentStartDate(summary?.investmentStartDate || null);
      setTransactions(Array.isArray(txs) ? txs : []);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    refreshSummaryAndTransactions();
  }, [refreshSummaryAndTransactions]);

  // ---- Invest Flow ----
  const handleInvestNow = async (e) => {
    e.preventDefault();
    if (error || !investmentAmount) {
      return alert(error || "Please enter an amount");
    }
    if (!user?.uid) return alert("Please log in again.");

    const amountNum = parseFloat(investmentAmount);
    if (isNaN(amountNum) || amountNum < 100) {
      return alert("Minimum investment is $100");
    }

    try {
      setLoading(true);
      const payCurrency = payCurrencyByCoinId[selectedCoin];
      const resp = await createPayment(amountNum, payCurrency, user.uid);

      // ✅ only wallet details, no invoice_url
      setPendingPayment(resp);
      setShowWallet(true);
      setInvestmentConfirmed(false);

      setTransactions((prev) => [
        {
          id: `temp-${Date.now()}`,
          type: "deposit",
          amount: amountNum,
          currency: "USD",
          coin: coinSymbols[selectedCoin],
          date: new Date().toISOString(),
          status: "pending",
        },
        ...prev,
      ]);

      setInvestmentAmount("");
      setError("");
    } catch (err) {
      console.error(err);
      alert("Could not start payment.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    await refreshSummaryAndTransactions();
    setShowWallet(false);
    setInvestmentConfirmed(true);
  };

  // ---- Withdraw Flow ----
  const handleWithdraw = async () => {
    setWithdrawError("");
    const withdrawNum = parseFloat(withdrawAmount);
    if (!user?.uid) return setWithdrawError("Please log in again.");
    if (!withdrawWallet) return setWithdrawError("Enter wallet address.");
    if (isNaN(withdrawNum) || withdrawNum <= 0)
      return setWithdrawError("Enter valid amount.");
    if (withdrawNum > currentBalance)
      return setWithdrawError("Cannot exceed balance.");

    try {
      setPendingWithdrawal(true);
      await requestWithdrawal({
        userId: user.uid,
        amount: withdrawNum,
        coin: coinSymbols[selectedCoin],
        address: withdrawWallet,
      });
      setTransactions((prev) => [
        {
          id: `wd-${Date.now()}`,
          type: "withdrawal",
          amount: withdrawNum,
          currency,
          coin: null,
          date: new Date().toISOString(),
          status: "pending",
        },
        ...prev,
      ]);
      setWithdrawAmount("");
      setWithdrawWallet("");
      alert("Withdrawal submitted.");
      refreshSummaryAndTransactions();
    } catch (e) {
      setWithdrawError("Withdrawal failed.");
    } finally {
      setPendingWithdrawal(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-yellow-900 to-black text-white p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-yellow-400">
          Welcome, {user?.displayName || user?.email || "Investor"}
        </h1>
        <button
          onClick={refreshSummaryAndTransactions}
          className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Investment Section */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-yellow-400 text-2xl font-bold mb-4">
            Make an Investment
          </h2>
          <form onSubmit={handleInvestNow} className="space-y-4">
            <input
              type="number"
              min={100}
              value={investmentAmount}
              onChange={handleInvestmentChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
              placeholder="Minimum $100"
              required
            />
            <select
              value={selectedCoin}
              onChange={(e) => setSelectedCoin(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
            >
              {coinOptions.map((c) => (
                <option key={c} value={c}>
                  {coinSymbols[c]}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-yellow-500 text-black px-6 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Creating..." : "Invest Now"}
            </button>
            {showWallet && (
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="ml-3 bg-gray-700 text-white px-4 py-2 rounded"
              >
                I've Paid — Refresh
              </button>
            )}
          </form>

          {pendingPayment && showWallet && (
            <div className="mt-6 bg-yellow-900 p-4 rounded text-yellow-100">
              <h3 className="font-bold mb-2">Send Payment</h3>
              <p>
                Send{" "}
                <strong>
                  {pendingPayment.pay_amount}{" "}
                  {pendingPayment.pay_currency?.toUpperCase()}
                </strong>{" "}
                to:
              </p>
              <p className="break-all text-yellow-300 mt-2">
                {pendingPayment.pay_address}
              </p>
            </div>
          )}
        </div>

        {/* Withdrawal */}
        <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-yellow-400 text-2xl font-bold mb-4">
            Withdraw Funds
          </h2>
          <input
            type="number"
            min="1"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white mb-3"
            placeholder="Amount"
          />
          <input
            type="text"
            value={withdrawWallet}
            onChange={(e) => setWithdrawWallet(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white mb-3"
            placeholder="Wallet address"
          />
          {withdrawError && <p className="text-red-500">{withdrawError}</p>}
          <button
            onClick={handleWithdraw}
            className="bg-yellow-500 text-black px-6 py-2 rounded"
          >
            Withdraw
          </button>
        </div>
      </section>

      <WalletInfo />

      {/* Transactions */}
      <section className="mt-12 max-w-4xl mx-auto bg-gray-900 p-6 rounded-lg">
        <h2 className="text-yellow-400 text-2xl font-bold mb-4">
          Transaction History
        </h2>
        {transactions.length === 0 ? (
          <p className="text-gray-300">No transactions yet.</p>
        ) : (
          <table className="w-full text-left text-white">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Coin</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={i}>
                  <td>{tx.type}</td>
                  <td>${Number(tx.amount).toFixed(2)}</td>
                  <td>{tx.crypto || "-"}</td>
                  <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td>{tx.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Support + Logout (tight, no big space) */}
      <div className="bg-gradient-to-b from-black via-yellow-900 to-black text-white p-8 mt-8">
        <SupportCenter />
        <button
          onClick={handleLogout}
          className="mt-6 px-6 py-2 bg-yellow-500 text-black rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
