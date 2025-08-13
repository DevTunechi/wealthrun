// src/components/CryptoCarousel.jsx
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Import coin images from src/assets
import btcImg from "../assets/btc.png";
import ethImg from "../assets/eth.png";
import usdtImg from "../assets/usdt.png";
import piImg from "../assets/pi.png";

const CryptoCarousel = () => {
  const [prices, setPrices] = useState({});
  const [loaded, setLoaded] = useState(false);

  const coins = [
    { id: "bitcoin", symbol: "BTC", img: btcImg },
    { id: "ethereum", symbol: "ETH", img: ethImg },
    { id: "tether", symbol: "USDT", img: usdtImg },
    { id: "pi-network", symbol: "PI", img: piImg },
  ];

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const ids = coins.map((c) => c.id).join(",");
        const res = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
        );
        setPrices(res.data);
        setLoaded(true);
      } catch (error) {
        console.error("Error fetching prices:", error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 2500,
    slidesToShow: 3, // Show 3 coins at once
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      {
        breakpoint: 768, // Mobile
        settings: { slidesToShow: 1 },
      },
      {
        breakpoint: 1024, // Tablet
        settings: { slidesToShow: 2 },
      },
    ],
  };

  return (
    <div
      className={`w-full max-w-lg mx-auto transition-opacity duration-500 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    >
      <Slider {...settings}>
        {coins.map((coin) => (
          <div
            key={coin.symbol}
            className="flex flex-col items-center justify-center text-center"
          >
            <img
              src={coin.img}
              alt={coin.symbol}
              className="w-40 h-40 md:w-48 md:h-48 object-contain drop-shadow-1xl transform hover:scale-105 transition-transform duration-300"
            />
            <p className="mt-3 text-2xl font-bold text-yellow-500 drop-shadow text-center">
              {prices[coin.id]?.usd
                ? `$${prices[coin.id].usd.toLocaleString()}`
                : "Loading..."}
            </p>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default CryptoCarousel;
