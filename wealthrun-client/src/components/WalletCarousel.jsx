// src/components/WalletCarousel.jsx
import React from "react";

const WalletCarousel = () => {
  const walletImages = [
    "/images/btc-balance.png",
    "/images/eth-balance.png",
    "/images/usdt-balance.png",
  ];

  return (
    <section className="bg-gradient-to-b from-black via-yellow-900 to-black py-20 px-6 text-center">
      <h2 className="text-4xl font-extrabold text-yellow-400 mb-4">
        Our Current Balances
      </h2>
      <p className="text-lg text-gray-200 mb-14">
        Join us by investing as little as $100 to secure your future
      </p>

      <div className="flex flex-wrap justify-center gap-10">
        {walletImages.map((src, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-xl overflow-hidden w-60 border-4 border-yellow-400 transform transition duration-300 hover:scale-105"
          >
            <img
              src={src}
              alt={`Wallet ${index + 1}`}
              className="w-full h-[500px] object-contain bg-black"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default WalletCarousel;
