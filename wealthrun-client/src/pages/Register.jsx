// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../services/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { motion } from "framer-motion";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirm) return alert("Passwords do not match");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update the display name after registration
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
      }

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
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">Create Account</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-yellow-400 mb-1">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-yellow-400"
              placeholder="Your name"
              required
            />
          </div>

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

          <div>
            <label className="block text-yellow-400 mb-1">Confirm Password</label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type="password"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-yellow-500 text-black rounded-lg font-bold hover:bg-yellow-400 transition"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-gray-300">
          Already have an account?{" "}
          <Link to="/login" className="text-yellow-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
