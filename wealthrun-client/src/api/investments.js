// src/api/investments.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function fetchInvestmentSummary(userId) {
  const res = await fetch(`${BASE_URL}/api/investments/${userId}`);
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
    body: JSON.stringify({ userId, amount: Number(amount), coin, address }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "Withdrawal failed");
  }
  return res.json();
}
