import React from "react";
import { Link } from "react-router-dom";
import CountUp from "react-countup";

export default function InvestmentDetails() {
  return (
    <div className="bg-gradient-to-b from-black to-yellow-900 text-white min-h-screen px-6 py-10">
      {/* Page Title */}
      <h1 className="text-4xl font-bold text-center text-yellow-400 mb-8">
        WealthRun Investment Plans
      </h1>

      {/* Hero Image */}
      <div className="flex justify-center mb-10">
        <img
          src="https://cryptologos.cc/logos/bitcoin-btc-logo.png"
          alt="BTC"
          className="w-32 h-32 mx-4"
        />
        <img
          src="https://cryptologos.cc/logos/ethereum-eth-logo.png"
          alt="ETH"
          className="w-32 h-32 mx-4"
        />
        <img
          src="https://cryptologos.cc/logos/tether-usdt-logo.png"
          alt="USDT"
          className="w-32 h-32 mx-4"
        />
      </div>

      {/* Plan 1 */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-yellow-400 mb-4">
          Plan 1: 10% Monthly Profit
        </h2>
        <p className="mb-3">
          For investments between <span className="font-bold">$100</span> and{" "}
          <span className="font-bold">$999</span>, you’ll earn a steady{" "}
          <span className="font-bold">10% profit monthly</span>.
        </p>
        <p className="mb-3">
          Example: Invest $500 → Monthly profit ={" "}
          <span className="text-green-400 font-bold">
            $
            <CountUp start={0} end={50} duration={2} separator="," />
          </span>{" "}
          → Yearly ={" "}
          <span className="text-green-400 font-bold">
            $
            <CountUp start={0} end={600} duration={2.5} separator="," />
          </span>
        </p>
        <img
          src="https://images.unsplash.com/photo-1627537117805-9a5c2f3c6b70"
          alt="Plan 1"
          className="rounded-lg mt-4"
        />
      </div>

      {/* Plan 2 */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-yellow-400 mb-4">
          Plan 2: 15% Monthly Profit
        </h2>
        <p className="mb-3">
          For investments <span className="font-bold">$1,000 and above</span>, you’ll earn{" "}
          <span className="font-bold">15% profit monthly</span>.
        </p>
        <p className="mb-3">
          Example: Invest $2,000 → Monthly profit ={" "}
          <span className="text-green-400 font-bold">
            $
            <CountUp start={0} end={300} duration={2} separator="," />
          </span>{" "}
          → Yearly ={" "}
          <span className="text-green-400 font-bold">
            $
            <CountUp start={0} end={3600} duration={2.5} separator="," />
          </span>
        </p>
        <img
          src="https://images.unsplash.com/photo-1620823074629-4a5d8e99c6a3"
          alt="Plan 2"
          className="rounded-lg mt-4"
        />
      </div>

      {/* How it Works */}
      <div className="bg-gray-900 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-yellow-400 mb-4">
          How WealthRun Works
        </h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Register and verify your account.</li>
          <li>Select your investment plan.</li>
          <li>Deposit into our official wallet for BTC, ETH, or USDT.</li>
          <li>Track daily profits on your dashboard.</li>
          <li>Withdraw anytime, with processing in under 30 minutes.</li>
        </ol>
      </div>

      {/* CTA */}
      <div className="text-center mt-8">
        <Link
          to="/register"
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg shadow-lg"
        >
          Start Investing Now
        </Link>
      </div>
    </div>
  );
}
