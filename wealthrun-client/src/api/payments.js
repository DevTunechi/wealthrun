// src/api/payments.js
import { auth } from "../services/firebase.js"; // ensure Firebase is initialized

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Create a payment invoice via WealthRun backend
 * @param {number} amount - The USD amount to invest
 * @param {string} coin - The crypto coin to pay with (BTC, ETH, USDT, etc.)
 */
export async function createPayment(amount, coin) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const res = await fetch(`${BASE_URL}/api/payments/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // CORS + cookies
      body: JSON.stringify({
        amount,
        coin: coin.toUpperCase(), // ✅ pay currency
        userId: user.uid,         // ✅ Firebase UID
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to create payment");
    }

    return res.json(); // { payment_url, payment_id }
  } catch (error) {
    console.error("Payment API error:", error);
    throw error;
  }
}

/**
 * For quick testing without auth
 */
export async function createTestPayment() {
  try {
    const res = await fetch(`${BASE_URL}/api/payments/create-test`, {
      credentials: "include",
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to create test payment");
    }
    return res.json(); // { payment_url, payment_id }
  } catch (error) {
    console.error("Test Payment API error:", error);
    throw error;
  }
}
