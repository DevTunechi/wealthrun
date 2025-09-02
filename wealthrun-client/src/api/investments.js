import axios from "axios";

// Use same consistent API base
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ✅ Existing investment functions
// ✅ FIX: The backend is looking for a summary endpoint, so we add it to the URL.
export async function fetchInvestmentSummary(userId) {
  const res = await fetch(`${BASE_URL}/api/investments/summary/${userId}`, {
    credentials: "include", // important for CORS + cookies
  });
  if (!res.ok) throw new Error("Failed to fetch investment summary");
  return res.json();
}

// ✅ New function to fetch available investment plans
export async function fetchInvestmentPlans() {
  const res = await fetch(`${BASE_URL}/api/investments/plans`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch investment plans");
  return res.json();
}

export async function fetchTransactions(userId) {
  const res = await fetch(`${BASE_URL}/api/transactions/${userId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export async function requestWithdrawal({ userId, amount, coin, address }) {
  const res = await fetch(`${BASE_URL}/api/withdrawals/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
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
    const res = await axios.post(
      `${BASE_URL}/api/payments/create`,
      { userId, amount, currency },
      { withCredentials: true } // CORS-friendly
    );

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