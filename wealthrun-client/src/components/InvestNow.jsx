import { useState } from "react";
import axios from "axios";

export default function InvestNow() {
  const [amount, setAmount] = useState("");

  const handleInvest = async () => {
    try {
      const res = await axios.post(
        "https://wealthrun-backend.up.railway.app/api/payments/create",
        { amount: Number(amount), currency: "usd" },
        { headers: { "Content-Type": "application/json" } }
      );

      // NOWPayments returns an invoice with payment_url
      window.location.href = res.data.invoice_url; 
    } catch (err) {
      console.error("Payment error:", err.response?.data || err.message);
      alert("Could not start payment. Please try again.");
    }
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg">
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="p-2 rounded text-black"
      />
      <button
        onClick={handleInvest}
        className="ml-2 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg"
      >
        Invest Now
      </button>
    </div>
  );
}
