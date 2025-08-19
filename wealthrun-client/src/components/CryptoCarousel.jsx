// src/components/CryptoCarousel.jsx
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import btcImg from "../assets/btc.png";
import ethImg from "../assets/eth.png";
import usdtImg from "../assets/usdt.png";
import piImg from "../assets/pi.png";

const coins = [
  { id: "bitcoin", symbol: "BTC", img: btcImg },
  { id: "ethereum", symbol: "ETH", img: ethImg },
  { id: "tether", symbol: "USDT", img: usdtImg },
  { id: "pi-network", symbol: "PI", img: piImg },
];

const CryptoCarousel = () => {
  const [data, setData] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const ids = coins.map((c) => c.id).join(",");
        const res = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );
        setData(res.data);
        setLoaded(true);
      } catch (error) {
        console.error("Error fetching prices:", error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 1 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <div
      className={`w-full max-w-md mx-auto bg-black-100 bg-opacity-30 rounded-xl shadow-lg p-9 transition-opacity duration-300 ${
        loaded ? "opacity-100" : "opacity-30"
      }`}
    >
      <Slider {...settings}>
        {coins.map((coin) => {
          const price = data[coin.id]?.usd;
          const change = data[coin.id]?.usd_24h_change;
          const formattedChange =
            change != null ? `${change.toFixed(2)}%` : "—";

          return (
            <div
              key={coin.symbol}
              className="flex flex-col items-center justify-center text-center"
            >
              <img
                src={coin.img}
                alt={coin.symbol}
                className="w-24 h-24 md:w-24 md:h-24 object-contain drop-shadow-md transition-transform hover:scale-105 duration-300"
              />
              <p className="mt-2 text-lg font-semibold text-yellow-400">
                {price != null ? `$${price.toLocaleString()}` : "Loading..."}
              </p>
              <p
                className={`text-sm font-semibold ${
                  change != null
                    ? change >= 0
                      ? "text-green-400"
                      : "text-red-400"
                    : "text-gray-400"
                }`}
              >
                {change === null ? "—" : (change >= 0 ? "+" : "-")}{Math.abs(change).toFixed(2)}%
              </p>
            </div>
          );
        })}
      </Slider>
    </div>
  );
};

export default CryptoCarousel;
