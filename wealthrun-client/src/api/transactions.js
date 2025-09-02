import axios from "axios";

// ✅ FIX: Use consistent BASE_URL
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function fetchTransactions(userId) {
  if (!userId) {
    console.error("❌ Invalid userId: missing or empty.");
    return [];
  }

  console.log("📤 Fetching transactions for userId:", userId);

  try {
    // ✅ FIX: Use fetch and a correctly formed URL.
    const res = await fetch(`${BASE_URL}/api/transactions/${userId}`, {
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to fetch transactions");
    return res.json();
  } catch (error) {
    console.error("❌ Failed to fetch transactions:", error);
    return [];
  }
}