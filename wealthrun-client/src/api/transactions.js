// src/api/transactions.js
import api from "../services/api";

export async function fetchTransactions(userId) {
  if (!userId) {
    console.error("❌ Invalid userId: missing or empty.");
    return [];
  }

  console.log("📤 Fetching transactions for userId:", userId);

  try {
    const res = await api.get(`/api/transactions/${userId}`);
    return res.data;
  } catch (error) {
    console.error("❌ Failed to fetch transactions:", error);
    return [];
  }
}
