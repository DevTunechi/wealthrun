// src/api/payments.js
import { auth } from "../services/firebase.js"; // ensure Firebase is initialized
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Create a payment via WealthRun backend
 * @param {number} amount - The USD amount to invest
 * @param {string} coin - The crypto coin to pay with (btc, eth, usdt, etc.)
 */
export async function createPayment(amount, coin) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const res = await axios.post(
      `${BASE_URL}/api/payments/create`,
      {
        amount,
        coin: coin.toUpperCase(),
        userId: user.uid,
      },
      { withCredentials: true }
    );

    // ✅ Return only wallet details (no redirect, no invoice_url)
    return {
      payment_id: res.data.payment_id,
      pay_address: res.data.pay_address,
      pay_amount: res.data.pay_amount,
      pay_currency: res.data.pay_currency,
      payment_status: res.data.payment_status,
    };
  } catch (error) {
    console.error("Payment API error:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * For quick testing without auth
 */
export async function createTestPayment() {
  try {
    const res = await axios.get(`${BASE_URL}/api/payments/create-test`, {
      withCredentials: true,
    });
    return res.data; // mock response for dev
  } catch (error) {
    console.error("Test Payment API error:", error.response?.data || error.message);
    throw error;
  }
}
