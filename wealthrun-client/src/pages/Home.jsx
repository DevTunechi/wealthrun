// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SupportCenter from "../components/SupportCenter";

const Home = () => {
  return (
    <>
      <section className="bg-gradient-to-r from-yellow-100 via-white to-yellow-50 py-20 px-6 md:px-20 text-center md:text-left flex flex-col md:flex-row items-center overflow-hidden">

        {/* Text Content */}
        <motion.div
          className="flex-1 space-y-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Grow Your <span className="text-yellow-600">Wealth</span>, Secure Your <span className="text-green-600">Future!</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-lg">
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
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg"
            >
              Investment Details
            </Link>
          </div>
        </motion.div>

        {/* Image / Illustration */}
        <motion.div
          className="flex-1 mt-10 md:mt-0"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          <img
            src="https://images.unsplash.com/photo-1642790552726-bd580ef7d5d0"
            alt="WealthRun Investments"
            className="w-full max-w-md mx-auto rounded-xl shadow-lg"
          />
        </motion.div>
      </section>

      <div className="min-h-screen bg-gradient-to-b from-black via-yellow-900 to-black text-white p-8">
        {/* Other dashboard content here */}
        <SupportCenter />
      </div>
    </>
  );
};

export default Home;
