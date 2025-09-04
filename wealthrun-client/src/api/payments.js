// src/api/payments.js
import { auth } from "../services/firebase.js"; // ensure Firebase is initialized
import axios from "axios";

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

    const res = await axios.post(`${BASE_URL}/api/payments/create`, {
      amount,
      coin: coin.toUpperCase(),
      userId: user.uid,
    }, { withCredentials: true });

    if (res.data && res.data.payment_url) {
      window.location.href = res.data.payment_url;
    } else {
      throw new Error("No payment URL received");
    }

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
    return res.data; // { payment_url, payment_id }
  } catch (error) {
    console.error("Test Payment API error:", error.response?.data || error.message);
    throw error;
  }
}