import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CryptoCarousel = () => {
  const [prices, setPrices] = useState({});
  
  const coins = [
    { id: "bitcoin", symbol: "BTC", img: "/assets/btc-coin.png" },
    { id: "ethereum", symbol: "ETH", img: "/assets/eth-coin.png" },
    { id: "tether", symbol: "USDT", img: "/assets/usdt-coin.png" },
    { id: "pi-network", symbol: "PI", img: "/assets/pi-coin.png" }
  ];

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const ids = coins.map(c => c.id).join(",");
        const res = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
        );
        setPrices(res.data);
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
    autoplaySpeed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true
  };

  return (
    <div className="max-w-sm mx-auto my-8">
      <Slider {...settings}>
        {coins.map((coin) => (
          <div key={coin.symbol} className="text-center">
            <img
              src={coin.img}
              alt={coin.symbol}
              className="mx-auto w-40 h-40 object-contain"
            />
            <p className="mt-2 text-xl font-bold text-yellow-500">
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
