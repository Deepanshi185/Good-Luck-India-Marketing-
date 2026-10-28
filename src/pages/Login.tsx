// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleanId = userId.trim();
      const userRef = doc(db, "users", cleanId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error(`User ID "${cleanId}" not found in database.`);
      }

      // Extract user document data
      const userData = userSnap.data();

      // Store active user session
      localStorage.setItem("activeUserId", cleanId);

      // Check role or ID format for Admin routing
      if (userData?.role === "admin" || cleanId.toLowerCase().startsWith("admin")) {
        localStorage.setItem("userRole", "admin");
        navigate("/admin/dashboard");
      } else {
        localStorage.setItem("userRole", "member");
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#4a2608] via-[#8b1e1e] to-[#4a2608] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-black p-8 rounded-3xl border border-gray-800 shadow-2xl">
        <h1 className="text-3xl font-bold text-[#D4AF37] text-center mb-2">Member Portal</h1>
        <p className="text-gray-400 text-center mb-6">Enter your ID to access your account</p>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-red-900/50 text-red-400 border border-red-700 text-sm text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[#FFD21C] text-sm font-semibold mb-1">User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. FAT001 or ADMIN100"
              className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:border-[#FFD21C] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[#FFD21C] text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:border-[#FFD21C] outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 rounded-full bg-gradient-to-r from-[#FFD21C] to-[#F59E0B] text-black font-bold text-lg hover:scale-[1.01] transition disabled:opacity-50"
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}