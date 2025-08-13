import React from "react";
import { FaBitcoin, FaEthereum, FaCreditCard } from "react-icons/fa";

const PaymentInfoSection = () => {
  return (
    <section className="bg-gradient-to-b from-black via-black to-yellow-900 text-white py-16 px-6 md:px-20">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        
        {/* Left Content */}
        <div>
          <span className="bg-yellow-600 text-black px-3 py-1 rounded text-sm font-semibold">
            Invest with zero deposit fees
          </span>
          <h2 className="mt-4 text-4xl font-extrabold text-yellow-500 leading-tight">
            More Money in Your Portfolio
          </h2>
          <p className="mt-4 text-gray-300">
            No deposit or withdrawal fees on supported payment methods.
            More opportunities to grow your investments and make impactful decisions.
          </p>
          <a href="#" className="mt-4 inline-block underline text-yellow-400 hover:text-yellow-300">
            Read more
          </a>
        </div>

        {/* Right Content */}
        <div className="bg-black rounded-2xl p-6 shadow-lg space-y-4">
          {/* Crypto Option 1 */}
          <div className="flex justify-between items-center border-b border-gray-700 pb-4">
            <div className="flex items-center gap-3">
              <FaBitcoin size={28} className="text-yellow-500" />
              <span className="font-semibold">Bitcoin</span>
            </div>
            <span className="text-yellow-400 font-medium">Free</span>
          </div>

          {/* Crypto Option 2 */}
          <div className="flex justify-between items-center border-b border-gray-700 pb-4">
            <div className="flex items-center gap-3">
              <FaEthereum size={28} className="text-yellow-500" />
              <span className="font-semibold">Ethereum</span>
            </div>
            <span className="text-yellow-400 font-medium">Free</span>
          </div>

          {/* Mastercard */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FaCreditCard size={28} className="text-yellow-500" />
              <span className="font-semibold">Mastercard</span>
            </div>
            <span className="text-yellow-400 font-medium">Free</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentInfoSection;
