// src/pages/Dashboard.jsx
import SupportCenter from "../components/SupportCenter";
import WalletInfo from "../components/WalletInfo";
import React, { useState, useEffect } from "react";
import { logout } from "../services/firebase";
import { useNavigate } from "react-router-dom";

const coinOptions = ["bitcoin", "ethereum", "tether"];
const coinSymbols = {
  bitcoin: "BTC",
  ethereum: "ETH",
  tether: "USDT",
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

  const [currency, setCurrency] = useState("USD");
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [coinPrices, setCoinPrices] = useState({});
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [error, setError] = useState("");

  const [investedAmount, setInvestedAmount] = useState(0);
  const [dailyProfit, setDailyProfit] = useState(0);
  const [showWallet, setShowWallet] = useState(false);
  const [investmentConfirmed, setInvestmentConfirmed] = useState(false);
  const [investmentStartDate, setInvestmentStartDate] = useState(null);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawWallet, setWithdrawWallet] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [pendingWithdrawal, setPendingWithdrawal] = useState(false);

  // Dummy transaction history state
  const [transactions, setTransactions] = useState([
    // Sample transactions - to be replaced with backend data later
    {
      id: 1,
      type: "deposit",
      amount: 500,
      currency: "USD",
      coin: "BTC",
      date: new Date(Date.now() - 86400000 * 5), // 5 days ago
      status: "completed",
    },
    {
      id: 2,
      type: "profit",
      amount: 5,
      currency: "USD",
      coin: "BTC",
      date: new Date(Date.now() - 86400000 * 2), // 2 days ago
      status: "completed",
    },
    {
      id: 3,
      type: "withdrawal",
      amount: 100,
      currency: "USD",
      coin: null,
      date: new Date(Date.now() - 86400000), // 1 day ago
      status: "pending",
    },
  ]);

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

  const investmentNum = parseFloat(investmentAmount);
  let plan = null;
  let minInvestment = 100;
  let monthlyProfitPercent = 0.10;

  if (investmentNum >= 1000) {
    plan = "Premium Plan";
    minInvestment = 1000;
    monthlyProfitPercent = 0.15;
  } else if (investmentNum >= 100) {
    plan = "Basic Plan";
    minInvestment = 100;
    monthlyProfitPercent = 0.10;
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
    ? Math.floor((Date.now() - investmentStartDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const currentBalance = investedAmount + dailyProfit * daysSinceInvestment;

  const handleInvestNow = (e) => {
    e.preventDefault();
    if (error || !investmentAmount) {
      alert(error || "Please enter a valid investment amount");
      return;
    }
    const investmentNumVal = parseFloat(investmentAmount);
    const monthlyProfit = investmentNumVal >= 1000 ? 0.15 : 0.10;
    setInvestedAmount(investmentNumVal);
    setDailyProfit((investmentNumVal * monthlyProfit) / 30);
    setShowWallet(true);
    setInvestmentConfirmed(false);
    setInvestmentStartDate(null);
    alert(
      `Plan: ${
        investmentNumVal >= 1000 ? "Premium" : "Basic"
      }. Please send payment to wallet and confirm below.`
    );
    setInvestmentAmount("");
    setError("");
  };

  const handleConfirmPayment = () => {
    setInvestmentConfirmed(true);
    setInvestmentStartDate(new Date());
    setShowWallet(false);
    alert("Payment confirmed! Your investment is now active.");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleWithdraw = () => {
    setWithdrawError("");
    const withdrawNum = parseFloat(withdrawAmount);
    if (!withdrawWallet) {
      setWithdrawError("Please enter withdrawal wallet address.");
      return;
    }
    if (isNaN(withdrawNum) || withdrawNum <= 0) {
      setWithdrawError("Please enter a valid withdrawal amount.");
      return;
    }
    if (withdrawNum > currentBalance) {
      setWithdrawError(`Withdrawal amount cannot exceed your balance (${currentBalance.toFixed(2)}).`);
      return;
    }
    setPendingWithdrawal(true);
    alert(`Withdrawal request for ${withdrawNum} submitted. It will be credited within 30 minutes.`);
    setWithdrawAmount("");
    setWithdrawWallet("");
    setTimeout(() => setPendingWithdrawal(false), 1000 * 60 * 30);
  };

  // Format date nicely
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  // Color code statuses
  const statusColors = {
    completed: "text-green-400",
    pending: "text-yellow-400",
    failed: "text-red-500",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-yellow-900 to-black text-white p-8">
      {/* User Welcome */}
      <div className="flex items-center space-x-4 mb-10">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt="User Avatar"
            className="w-20 h-20 rounded-full border-2 border-yellow-400"
          />
        )}
        <h1 className="text-3xl font-bold text-yellow-400">
          Welcome, {user.displayName || user.email}
        </h1>
      </div>

      {/* Investment Plans */}
      <section className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Basic Plan */}
        <div className="bg-gray-900 bg-opacity-70 rounded-lg p-6 shadow-lg border border-yellow-600">
          <h2 className="text-yellow-400 text-2xl font-bold mb-2">Basic Plan</h2>
          <p className="mb-2">
            Invest <span className="font-semibold">$100 - $999</span>
          </p>
          <p className="mb-2">Earn <span className="font-semibold">10%</span> monthly profit</p>
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
          <p className="mb-2">Earn <span className="font-semibold">15%</span> monthly profit</p>
          <p className="text-sm text-gray-300">
            Daily interest reflected on your invested capital.
          </p>
        </div>
      </section>

      {/* Currency Selector */}
      <section className="mb-6">
        <label className="text-yellow-400 font-semibold mr-4">Select Currency:</label>
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

      {/* Investment and Withdrawal Side-by-Side */}
      <section className="grid md:grid-cols-2 gap-8">
        {/* Investment Section */}
        <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-yellow-400 text-2xl font-bold mb-4">Make an Investment</h2>
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
              <label className="block text-yellow-400 mb-1">Select Crypto Coin</label>
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

            <button
              type="submit"
              className="bg-yellow-500 text-black px-6 py-2 rounded hover:bg-yellow-400 transition"
            >
              Invest Now
            </button>
          </form>

          {showWallet && !investmentConfirmed && (
            <div className="mt-6 bg-yellow-900 p-4 rounded text-yellow-100">
              <h3 className="font-bold mb-2">Please send your payment to this wallet address:</h3>
              <p className="break-all">{wealthRunWallets[coinSymbols[selectedCoin]]}</p>
              <p className="mt-2">
                After sending payment, click Confirm Payment to validate your transaction.
              </p>
              <button
                onClick={handleConfirmPayment}
                className="mt-4 bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-400 transition"
              >
                Confirm Payment
              </button>
            </div>
          )}

          {investmentConfirmed && (
            <div className="mt-6 text-yellow-300 space-y-1">
              <p>
                <strong>Invested Amount:</strong> {currencySymbols[currency]}
                {investedAmount.toFixed(2)}
              </p>
              <p>
                <strong>Estimated Daily Profit:</strong> {currencySymbols[currency]}
                {dailyProfit.toFixed(2)}
              </p>
              <p>
                <strong>Current Balance:</strong> {currencySymbols[currency]}
                {currentBalance.toFixed(2)} (Including accrued profits)
              </p>
              <p className="text-sm text-gray-300 italic">
                Investment started {daysSinceInvestment} day{daysSinceInvestment !== 1 ? "s" : ""} ago.
              </p>
            </div>
          )}
        </div>

        {/* Withdrawal Section */}
        <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-yellow-400 text-2xl font-bold mb-4">Withdraw Funds</h2>

          {pendingWithdrawal && (
            <p className="mb-4 text-yellow-400 italic">
              Your withdrawal is pending and will be credited within 30 minutes.
            </p>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-yellow-400 mb-1">Withdrawal Amount ({currency})</label>
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
              <label className="block text-yellow-400 mb-1">Destination Wallet Address</label>
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

      {/* Wallet Info Section */}
      <WalletInfo />

      {/* Transaction History */}
      <section className="mt-12 max-w-4xl mx-auto bg-gray-900 bg-opacity-70 rounded-lg p-6 shadow-lg">
        <h2 className="text-yellow-400 text-2xl font-bold mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
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
              {transactions.map(({ id, type, amount, currency, coin, date, status }) => (
                <tr key={id} className="border-b border-gray-700">
                  <td className="py-2 capitalize">{type}</td>
                  <td className="py-2">
                    {currencySymbols[currency]} {amount.toFixed(2)}
                  </td>
                  <td className="py-2">{coin ? coinSymbols[coin] : "-"}</td>
                  <td className="py-2">{formatDate(date)}</td>
                  <td className={`py-2 font-semibold ${statusColors[status] || "text-gray-400"}`}>
                    {status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      
        <div className="min-h-screen bg-gradient-to-b from-black via-yellow-900 to-black text-white p-8">
          {/* Other dashboard content here */}

          {/* Support Center */}
          <SupportCenter />
        </div>

      {/* Logout Button */}
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
