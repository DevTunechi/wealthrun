// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";  // Import Footer here
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { auth } from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

export default function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-yellow-500 bg-gray-900">
        Loading...
      </div>
    );
  }

  const PrivateRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white">
        <Navbar user={user} />
        <main className="flex-grow">
          <Routes>
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/" element={<Home />} />

            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
            />

            <Route
              path="/register"
              element={!user ? <Register /> : <Navigate to="/dashboard" replace />}
            />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard user={user} />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
