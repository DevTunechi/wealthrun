
// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import api from "../services/api";
import { motion } from "framer-motion";

// ✅ Override for backend userId (from .env if needed)
const BACKEND_USER_ID = import.meta.env.VITE_BACKEND_USER_ID || null;

export default function Dashboard({ user }) {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Decide which userId to use (backend ID vs Firebase UID)
  const resolvedUserId = BACKEND_USER_ID || (user ? user.uid : null);

  useEffect(() => {
    if (!resolvedUserId) {
      console.error("❌ No valid userId found for backend calls.");
      setError("User not recognized. Please log in again.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // ✅ Fetch investment summary
        const summaryRes = await api.get(`/api/investments/summary/${resolvedUserId}`);
        setSummary(summaryRes.data);

        // ✅ Fetch transactions
        const txRes = await api.get(`/api/transactions/${resolvedUserId}`);
        setTransactions(txRes.data || []);
      } catch (err) {
        console.error("❌ Failed to fetch dashboard data:", err);
        setError("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedUserId]);

  const handleInvestNow = async (amount, coin) => {
    if (!resolvedUserId) {
      alert("No valid userId found. Please log in again.");
      return;
    }

    try {
      const res = await api.post("/api/payments/create", {
        amount,
        coin,
        userId: resolvedUserId, // ✅ Always use resolved ID
      });
      window.location.href = res.data.invoice_url;
    } catch (err) {
      console.error("Payment API error:", err);
      alert("Payment could not be initiated.");
    }
  };

  if (loading) {
    return <div className="p-6 text-yellow-500">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold text-yellow-400"
      >
        Dashboard
      </motion.h1>

      {/* Investment Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800 p-6 rounded-xl shadow-md"
      >
        <h2 className="text-xl font-semibold mb-2">Investment Summary</h2>
        <p>Total Invested: ${summary?._sum?.amount || 0}</p>
        <p>Active Investments: {summary?._count?.id || 0}</p>
      </motion.div>

      {/* Transactions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800 p-6 rounded-xl shadow-md"
      >
        <h2 className="text-xl font-semibold mb-2">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((tx) => (
              <li key={tx.id} className="border-b border-gray-700 pb-2">
                {tx.type} - {tx.crypto} - ${tx.amount} ({tx.status})
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      {/* Invest Now */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-800 p-6 rounded-xl shadow-md"
      >
        <h2 className="text-xl font-semibold mb-2">New Investment</h2>
        <button
          onClick={() => handleInvestNow(100, "btc")}
          className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-400"
        >
          Invest $100 in BTC
        </button>
      </motion.div>
    </div>
  );
}
