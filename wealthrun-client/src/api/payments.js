// src/api/payments.js
export async function createPayment(amount, currency, userId) {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/payments/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, userId }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to create payment");
    }

    const data = await res.json();
    return data; // { payment_url, payment_id }
  } catch (error) {
    console.error("Payment API error:", error);
    throw error;
  }
}
