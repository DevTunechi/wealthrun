// src/pages/Dashboard.jsx
import SupportCenter from "../components/SupportCenter";
import WalletInfo from "../components/WalletInfo";
import React, { useState, useEffect, useCallback } from "react";
import { logout } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { createTestPayment } from "../api/payments";

// Backend API helpers (Vite env expected: VITE_API_URL)
import { createPayment } from "../api/payments";
import {
  fetchInvestmentSummary,
  fetchTransactions,
  requestWithdrawal,
} from "../api/investments";

// ----- Constants kept exactly like your UI -----
const coinOptions = ["bitcoin", "ethereum", "tether"];
const coinSymbols = {
  bitcoin: "BTC",
  ethereum: "ETH",
  tether: "USDT",
};

// Map to NOWPayments pay_currency values
const payCurrencyByCoinId = {
  bitcoin: "btc",
  ethereum: "eth",
  tether: "usdt",
};

const currencySymbols = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const wealthRunWallets = {
  BTC: "bc1q54dvqs9rtk992tzjew0cdv8uyc9k9ge03nep92",
  ETH: "0x07aFDEdB27db01Af05967E547fA10C3642Eacb63",
  USDT: "0x07aFDEdB27db01Af05967E547fA10C3642Eacb63",
};

export default function Dashboard({ user }) {
  const navigate = useNavigate();

  // ---- UI state (preserved) ----
  const [currency, setCurrency] = useState("USD");
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [coinPrices, setCoinPrices] = useState({});
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [error, setError] = useState("");

  // ---- Stats pulled from backend ----
  const [investedAmount, setInvestedAmount] = useState(0);
  const [dailyProfit, setDailyProfit] = useState(0);
  const [investmentStartDate, setInvestmentStartDate] = useState(null);

  // ---- Local UI helpers ----
  const [showWallet, setShowWallet] = useState(false);
  const [investmentConfirmed, setInvestmentConfirmed] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawWallet, setWithdrawWallet] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [pendingWithdrawal, setPendingWithdrawal] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---- Prices (unchanged) ----
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

  const getPriceForCoin = (coin) => {
    if (!coinPrices[coin]) return "Loading...";
    const price = coinPrices[coin][currency.toLowerCase()];
    return price ? price : "N/A";
  };

  // ---- Plan logic (unchanged visual cues) ----
  const investmentNum = parseFloat(investmentAmount);
  let plan = null;
  let minInvestment = 100;

  if (!Number.isNaN(investmentNum)) {
    if (investmentNum >= 1000) {
      plan = "Premium Plan";
      minInvestment = 1000;
    } else if (investmentNum >= 100) {
      plan = "Basic Plan";
      minInvestment = 100;
    }
  }

  const handleInvestmentChange = (e) => {
    const val = e.target.value;
    setInvestmentAmount(val);
    if (val === "") {
      setError("");
      return;
    }
    const numVal = parseFloat(val);
    if (isNaN(numVal) || numVal < 100) {
      setError("Minimum investment is $100");
    } else if (numVal < minInvestment) {
      setError(`Minimum for selected plan is $${minInvestment}`);
    } else {
      setError("");
    }
  };

  const coinPrice = getPriceForCoin(selectedCoin);
  const coinQuantity =
    !isNaN(investmentNum) && coinPrice !== "Loading..." && coinPrice !== "N/A"
      ? (investmentNum / coinPrice).toFixed(6)
      : null;

  const daysSinceInvestment = investmentStartDate
    ? Math.floor((Date.now() - new Date(investmentStartDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const currentBalance = investedAmount + dailyProfit * daysSinceInvestment;

  // ---- Backend sync helpers ----
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
    } catch (e) {
      console.error("Failed to refresh data:", e);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    refreshSummaryAndTransactions();
  }, [refreshSummaryAndTransactions]);

  // ---- Invest flow (wired to NOWPayments via backend) ----
  const handleInvestNow = async (e) => {
    e.preventDefault();
    if (error || !investmentAmount) {
      alert(error || "Please enter a valid investment amount");
      return;
    }
    if (!user?.uid) {
      alert("Please log in again.");
      return;
    }

    const amountNum = parseFloat(investmentAmount);
    if (Number.isNaN(amountNum) || amountNum < 100) {
      alert("Minimum investment is $100");
      return;
    }

    try {
      setLoading(true);
      const payCurrency = payCurrencyByCoinId[selectedCoin]; // "btc", "eth", "usdt"
      const resp = await createPayment(amountNum, payCurrency, user.uid);

      // Keep your original UI flow: show wallet box + a direct payment button
      setShowWallet(true);
      setInvestmentConfirmed(false);

      if (resp?.payment_url) {
        // Open NOWPayments invoice in a new tab
        window.open(resp.payment_url, "_blank", "noopener,noreferrer");
      }

      // Optionally insert a local "pending deposit" row so users see something immediately
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
      console.error("Create payment failed:", err);
      alert("Could not start payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // You previously had a manual confirm button — we keep it,
  // but turn it into a "refresh" so the UI is preserved.
  const handleConfirmPayment = async () => {
    await refreshSummaryAndTransactions();
    setShowWallet(false);
    setInvestmentConfirmed(true);
    alert("If you completed the payment, it will reflect here shortly.");
  };

  // ---- Withdraw flow ----
  const handleWithdraw = async () => {
    setWithdrawError("");
    const withdrawNum = parseFloat(withdrawAmount);

    if (!user?.uid) {
      setWithdrawError("Please log in again.");
      return;
    }
    if (!withdrawWallet) {
      setWithdrawError("Please enter withdrawal wallet address.");
      return;
    }
    if (isNaN(withdrawNum) || withdrawNum <= 0) {
      setWithdrawError("Please enter a valid withdrawal amount.");
      return;
    }
    if (withdrawNum > currentBalance) {
      setWithdrawError(
        `Withdrawal amount cannot exceed your balance (${currentBalance.toFixed(2)}).`
      );
      return;
    }

    try {
      setPendingWithdrawal(true);
      await requestWithdrawal({
        userId: user.uid,
        amount: withdrawNum,
        coin: coinSymbols[selectedCoin],
        address: withdrawWallet,
      });

      // optimistic row
      setTransactions((prev) => [
        {
          id: `wd-${Date.now()}`,
          type: "withdrawal",
          amount: withdrawNum,
          currency: currency,
          coin: null,
          date: new Date().toISOString(),
          status: "pending",
        },
        ...prev,
      ]);

      setWithdrawAmount("");
      setWithdrawWallet("");
      alert(
        `Withdrawal request for ${currencySymbols[currency]}${withdrawNum} submitted. You will be notified when processed.`
      );
      // refresh to get real backend state
      refreshSummaryAndTransactions();
    } catch (e) {
      console.error("Withdrawal failed:", e);
      setWithdrawError(
        e?.message || "Withdrawal failed. Please try again later."
      );
    } finally {
      setPendingWithdrawal(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // ---- Helpers for table display ----
  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleString();
    } catch {
      return String(date);
    }
  };

  const statusColors = {
    completed: "text-green-400",
    confirmed: "text-green-400",
    pending: "text-yellow-400",
    failed: "text-red-500",
    canceled: "text-red-500",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-yellow-900 to-black text-white p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt="User Avatar"
              className="w-20 h-20 rounded-full border-2 border-yellow-400"
            />
          )}
          <h1 className="text-3xl font-bold text-yellow-400">
            Welcome, {user?.displayName || user?.email || "Investor"}
          </h1>
        </div>
        <button
          onClick={refreshSummaryAndTransactions}
          className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
          disabled={loading}
          title="Refresh balances & transactions"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Investment Plans (unchanged) */}
      <section className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Basic Plan */}
        <div className="bg-gray-900 bg-opacity-70 rounded-lg p-6 shadow-lg border border-yellow-600">
          <h2 className="text-yellow-400 text-2xl font-bold mb-2">Basic Plan</h2>
          <p className="mb-2">
            Invest <span className="font-semibold">$100 - $999</span>
          </p>
          <p className="mb-2">
            Earn <span className="font-semibold">10%</span> monthly profit
          </p>
          <p className="text-sm text-gray-300">
            Daily interest reflected on your invested capital.
          </p>
        </div>

        {/* Premium Plan */}
        <div className="bg-gray-900 bg-opacity-70 rounded-lg p-6 shadow-lg border border-yellow-600">
          <h2 className="text-yellow-400 text-2xl font-bold mb-2">Premium Plan</h2>
          <p className="mb-2">
            Invest <span className="font-semibold">$1,000 and above</span>
          </p>
          <p className="mb-2">
            Earn <span className="font-semibold">15%</span> monthly profit
          </p>
          <p className="text-sm text-gray-300">
            Daily interest reflected on your invested capital.
          </p>
        </div>
      </section>

      {/* Currency Selector */}
      <section className="mb-6">
        <label className="text-yellow-400 font-semibold mr-4">
          Select Currency:
        </label>
        <select
          className="rounded bg-gray-800 text-white p-2"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </section>

      {/* Investment + Withdrawal */}
      <section className="grid md:grid-cols-2 gap-8">
        {/* Investment Section */}
        <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-yellow-400 text-2xl font-bold mb-4">
            Make an Investment
          </h2>
          <form onSubmit={handleInvestNow} className="space-y-4">
            <div>
              <label className="block text-yellow-400 mb-1">
                Investment Amount ({currency})
              </label>
              <input
                type="number"
                min={100}
                value={investmentAmount}
                onChange={handleInvestmentChange}
                className="w-full p-2 rounded bg-gray-700 text-white focus:outline-yellow-400"
                placeholder={`Minimum $100`}
                required
              />
              {error && <p className="text-red-500 mt-1">{error}</p>}
              {coinQuantity && !error && (
                <p className="mt-2 text-yellow-400 text-sm">
                  You will receive approximately{" "}
                  <span className="font-semibold">
                    {coinQuantity} {coinSymbols[selectedCoin]}
                  </span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-yellow-400 mb-1">
                Select Crypto Coin
              </label>
              <select
                value={selectedCoin}
                onChange={(e) => setSelectedCoin(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white focus:outline-yellow-400"
              >
                {coinOptions.map((coin) => (
                  <option key={coin} value={coin}>
                    {coinSymbols[coin]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="bg-yellow-500 text-black px-6 py-2 rounded hover:bg-yellow-400 transition"
                disabled={loading}
              >
                {loading ? "Opening Invoice..." : "Invest Now"}
              </button>
              {showWallet && (
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                >
                  I've Paid — Refresh
                </button>
              )}
            </div>
          </form>

          {showWallet && !investmentConfirmed && (
            <div className="mt-6 bg-yellow-900 p-4 rounded text-yellow-100">
              <h3 className="font-bold mb-2">
                Wallet (for reference). Prefer using the secure payment invoice
                we opened in a new tab.
              </h3>
              <p className="break-all">
                {wealthRunWallets[coinSymbols[selectedCoin]]}
              </p>
              <p className="mt-2 text-sm opacity-80">
                Once payment clears on-chain, your dashboard will update
                automatically (or click “I’ve Paid — Refresh”).
              </p>
            </div>
          )}

          {(investmentConfirmed || investedAmount > 0) && (
            <div className="mt-6 text-yellow-300 space-y-1">
              <p>
                <strong>Invested Amount:</strong>{" "}
                {currencySymbols[currency]}
                {Number(investedAmount).toFixed(2)}
              </p>
              <p>
                <strong>Estimated Daily Profit:</strong>{" "}
                {currencySymbols[currency]}
                {Number(dailyProfit).toFixed(2)}
              </p>
              <p>
                <strong>Current Balance:</strong>{" "}
                {currencySymbols[currency]}
                {Number(currentBalance).toFixed(2)} (Including accrued profits)
              </p>
              <p className="text-sm text-gray-300 italic">
                {investmentStartDate
                  ? `Investment started ${daysSinceInvestment} day${
                      daysSinceInvestment !== 1 ? "s" : ""
                    } ago.`
                  : "No active investment yet."}
              </p>
            </div>
          )}
        </div>

        {/* Withdrawal Section */}
        <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-yellow-400 text-2xl font-bold mb-4">
            Withdraw Funds
          </h2>

          {pendingWithdrawal && (
            <p className="mb-4 text-yellow-400 italic">
              Your withdrawal is pending. You’ll be notified when processed.
            </p>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-yellow-400 mb-1">
                Withdrawal Amount ({currency})
              </label>
              <input
                type="number"
                min="1"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white focus:outline-yellow-400"
                placeholder="Enter amount to withdraw"
              />
            </div>

            <div>
              <label className="block text-yellow-400 mb-1">
                Destination Wallet Address
              </label>
              <input
                type="text"
                value={withdrawWallet}
                onChange={(e) => setWithdrawWallet(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white focus:outline-yellow-400"
                placeholder="Enter your wallet address"
              />
            </div>

            {withdrawError && <p className="text-red-500">{withdrawError}</p>}

            <button
              onClick={handleWithdraw}
              className="bg-yellow-500 text-black px-6 py-2 rounded hover:bg-yellow-400 transition"
            >
              Submit Withdrawal
            </button>
          </div>
        </div>
      </section>

      {/* Wallet Info Section (unchanged) */}
      <WalletInfo />

      {/* Transaction History (now wired) */}
      <section className="mt-12 max-w-4xl mx-auto bg-gray-900 bg-opacity-70 rounded-lg p-6 shadow-lg">
        <h2 className="text-yellow-400 text-2xl font-bold mb-4">
          Transaction History
        </h2>
        {!transactions || transactions.length === 0 ? (
          <p className="text-gray-300">No transactions yet.</p>
        ) : (
          <table className="w-full text-left text-white">
            <thead>
              <tr>
                <th className="border-b border-yellow-600 pb-2">Type</th>
                <th className="border-b border-yellow-600 pb-2">Amount</th>
                <th className="border-b border-yellow-600 pb-2">Coin</th>
                <th className="border-b border-yellow-600 pb-2">Date</th>
                <th className="border-b border-yellow-600 pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => {
                const {
                  id,
                  type,
                  amount,
                  currency: txCurrency = "USD",
                  coin,
                  date,
                  status,
                } = tx;
                return (
                  <tr key={id || idx} className="border-b border-gray-700">
                    <td className="py-2 capitalize">{type}</td>
                    <td className="py-2">
                      {currencySymbols[txCurrency] || ""}{" "}
                      {Number(amount).toFixed(2)}
                    </td>
                    <td className="py-2">
                      {coin ? coinSymbols[coin.toLowerCase()] || coin : "-"}
                    </td>
                    <td className="py-2">{formatDate(date)}</td>
                    <td
                      className={`py-2 font-semibold ${
                        statusColors[status?.toLowerCase()] || "text-gray-400"
                      }`}
                    >
                      {status || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Support Center (unchanged) */}
      <div className="min-h-screen bg-gradient-to-b from-black via-yellow-900 to-black text-white p-8">
        <SupportCenter />
      </div>

      {/* Logout */}
      <div className="mt-10">
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
