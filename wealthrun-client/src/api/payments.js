// src/api/payments.js
// Vite-friendly env var
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function createPayment(amount, currency, userId) {
  try {
    const res = await fetch(`${BASE_URL}/api/payments/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency, userId }),
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
