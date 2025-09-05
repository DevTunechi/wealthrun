import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../services/firebase";
import { motion } from "framer-motion";

// This import path is correct if google-logo.svg is in src/assets
import googleLogo from "../assets/Google.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Handle email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User successfully logged in.");
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log("User successfully logged in with Google.");
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-black via-gray-900 to-black"
    >
      <div className="w-full max-w-md bg-black p-8 rounded-2xl shadow-lg border border-yellow-500">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-yellow-400 mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-yellow-400"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-yellow-400 mb-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-yellow-500 text-black rounded-lg font-bold hover:bg-yellow-400 transition"
          >
            Login
          </button>
        </form>

        {/* Separator */}
        <div className="flex items-center justify-center my-4">
          <hr className="flex-grow border-gray-700" />
          <span className="mx-4 text-gray-500">OR</span>
          <hr className="flex-grow border-gray-700" />
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full py-2 bg-white text-black rounded-lg font-bold flex items-center justify-center space-x-2 hover:bg-gray-200 transition"
        >
          <img
            src={googleLogo} // This uses the imported image variable
            alt="Google logo"
            className="h-5 w-5"
          />
          <span>Sign in with Google</span>
        </button>

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