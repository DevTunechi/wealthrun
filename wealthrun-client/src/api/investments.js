// src/api/investments.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ✅ Existing investment functions
export async function fetchInvestmentSummary(userId) {
  const res = await fetch(`${API_URL}/api/investments/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch investment summary");
  return res.json();
}

export async function fetchTransactions(userId) {
  const res = await fetch(`${BASE_URL}/api/transactions/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export async function requestWithdrawal({ userId, amount, coin, address }) {
  const res = await fetch(`${BASE_URL}/api/withdrawals/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      amount: Number(amount),
      coin: coin.toLowerCase(),
      address,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "Withdrawal failed");
  }
  return res.json();
}

// ✅ New Payment API integration
export const createPayment = async ({ userId, amount, currency }) => {
  try {
    const res = await axios.post(`${BASE_URL}/api/payments/create`, {
      userId,
      amount,
      currency,
    });

    if (res.data && res.data.payment_url) {
      // ✅ redirect user to NOWPayments checkout
      window.location.href = res.data.payment_url;
    } else {
      throw new Error("No payment URL received");
    }
  } catch (err) {
    console.error("Payment creation failed:", err.response?.data || err.message);
    throw err;
  }
};
