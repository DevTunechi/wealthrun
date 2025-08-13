// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import CryptoCarousel from "../components/CryptoCarousel";
import PaymentInfoSection from "../components/PaymentInfoSection";
import { motion } from "framer-motion";
import SupportCenter from "../components/SupportCenter";

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-yellow-100 via-white to-yellow-50 py-20 px-6 md:px-20 flex flex-col md:flex-row items-center overflow-hidden">
        
        {/* Text Content */}
        <motion.div
          className="flex-1 space-y-6 text-center md:text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Grow Your <span className="text-yellow-600">Wealth</span>, Secure Your <span className="text-green-600">Future!</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-lg mx-auto md:mx-0">
            WealthRun helps you invest smarter with trusted experts, secure transactions,
            and growth strategies tailored just for you.
          </p>

          <div className="space-x-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg shadow hover:bg-yellow-700 transition"
            >
              Get Started
            </Link>

            <Link
              to="/investment-details"
              className="px-6 py-3 bg-transparent border border-yellow-600 text-yellow-600 rounded-lg hover:bg-yellow-600 hover:text-white transition"
            >
              Investment Details
            </Link>
          </div>
        </motion.div>

        {/* Carousel in Hero */}
        <motion.div
          className="flex-1 mt-10 md:mt-0 flex flex-col items-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-yellow-600 mb-6">
            Live Crypto Prices
          </h2>
          <CryptoCarousel />
        </motion.div>
      </section>
      
      <PaymentInfoSection />

      {/* Support Center */}
      <div className="min-h-screen bg-gradient-to-b from-black via-yellow-900 to-black text-white p-8">
        <SupportCenter />
      </div>
    </>
  );
};

export default Home;
