// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginWithEmail, signInWithGoogle, resetPassword } from "../services/firebase";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReset = async () => {
    if (!email) return alert("Enter your email to reset password");
    try {
      await resetPassword(email);
      alert("Password reset email sent");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4"
    >
      <div className="w-full max-w-md bg-black p-8 rounded-2xl shadow-lg border border-yellow-500">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">Login</h2>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-yellow-400 mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-yellow-400 mb-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-gray-300">
            <label className="flex items-center space-x-2 text-gray-300">
              <input type="checkbox" className="accent-yellow-400" /> <span>Remember me</span>
            </label>
            <button type="button" onClick={handleReset} className="text-yellow-400 hover:underline">
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Google Sign-In Button */}
        <div className="mt-6">
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center border border-yellow-500 rounded-md py-2 hover:bg-yellow-600 transition text-yellow-400"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Sign in with Google
          </button>
        </div>

        <p className="mt-4 text-center text-gray-300">
          Don't have an account?{" "}
          <Link to="/register" className="text-yellow-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
