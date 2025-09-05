import { useState, useEffect } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Initialize Firebase auth (if not already done elsewhere)
const auth = getAuth(); 

export default function InvestNow() {
  const [amount, setAmount] = useState("");
  const [selectedCoin, setSelectedCoin] = useState("BTC"); // Default to BTC
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  // Get the user ID from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleInvest = async () => {
    if (!amount || !selectedCoin || !userId) {
      setError("Please select a coin and enter a valid amount.");
      return;
    }
    setError(null); // Clear previous errors

    try {
      // ✅ Updated payload to match backend requirements
      const res = await axios.post(
        "https://wealthrun-backend.up.railway.app/api/payments/create",
        {
          amount: Number(amount),
          coin: selectedCoin, // Corrected field name
          userId, // Added userId
        },
        { headers: { "Content-Type": "application/json" } }
      );

      // ✅ Now it correctly receives the invoice_url
      window.location.href = res.data.invoice_url;
    } catch (err) {
      console.error("Payment error:", err.response?.data || err.message);
      setError("Could not start payment. Please try again.");
    }
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Make an Investment</h3>
      
      {/* Input for Amount */}
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="p-2 rounded text-black w-full mb-4 focus:ring-yellow-500 focus:border-yellow-500"
      />

      {/* Dropdown for Coin */}
      <div className="mb-4">
        <label htmlFor="coin-select" className="block text-sm font-medium text-gray-400 mb-1">
          Select Coin
        </label>
        <select
          id="coin-select"
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
          className="w-full p-2 rounded text-black bg-gray-200 focus:ring-yellow-500 focus:border-yellow-500"
        >
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
          <option value="USDT">USDT</option>
          {/* Add other coins if supported by NOWPayments */}
        </select>
      </div>

      {/* Invest Button */}
      <button
        onClick={handleInvest}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-bold transition duration-200 ease-in-out"
      >
        Invest Now
      </button>

      {/* Error Message Display */}
      {error && (
        <div className="mt-4 text-red-400 text-center text-sm font-semibold">
          {error}
        </div>
      )}
    </div>
  );
}