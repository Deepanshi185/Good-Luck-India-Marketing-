import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Eye, EyeOff, Lock, User, ShieldCheck } from "lucide-react";

export default function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleanId = userId.trim();
      const inputPassword = password.trim();

      if (!cleanId || !inputPassword) {
        throw new Error("Please enter both User ID and Password.");
      }

      // 1. Try exact document ID match
      let userRef = doc(db, "users", cleanId);
      let userSnap = await getDoc(userRef);

      // 2. Fallback: Try uppercase ID if user typed in lowercase on phone keyboard
      if (!userSnap.exists()) {
        const upperRef = doc(db, "users", cleanId.toUpperCase());
        userSnap = await getDoc(upperRef);
      }

      if (!userSnap.exists()) {
        throw new Error("Invalid User ID or Password.");
      }

      const userData = userSnap.data();

      // 3. 🔒 PASSWORD VERIFICATION CHECK
      const storedPassword = userData?.password;
      if (!storedPassword || storedPassword !== inputPassword) {
        throw new Error("Invalid User ID or Password.");
      }

      const confirmedUserId = userData?.userId || cleanId;

      // 4. Store active user session
      localStorage.setItem("activeUserId", confirmedUserId);

      // 5. Check role or ID format for Admin routing
      if (
        userData?.role === "admin" ||
        confirmedUserId.toLowerCase().startsWith("admin")
      ) {
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
    <div className="min-h-screen bg-gradient-to-br from-[#120604] via-[#2A1108] to-[#120604] flex items-center justify-center p-3 sm:p-6 overflow-x-hidden">
      <div className="w-full max-w-md bg-black/80 backdrop-blur-md p-5 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-2xl relative">
        
        {/* Top Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-[#FFD21C] to-[#F59E0B] flex items-center justify-center text-black font-extrabold shadow-lg">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD21C] via-[#D4AF37] to-[#F59E0B]">
            Good Luck India
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Enter your credentials to access your portal
          </p>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="p-3 mb-5 rounded-xl bg-red-950/80 text-red-300 border border-red-700/60 text-xs sm:text-sm text-center font-semibold animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* User ID Field */}
          <div>
            <label className="block text-[#FFD21C] text-xs sm:text-sm font-semibold mb-1.5">
              User ID
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. GLIM001 or Admin ID"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900/90 text-white text-xs sm:text-sm border border-gray-700 focus:border-[#FFD21C] focus:ring-1 focus:ring-[#FFD21C] outline-none transition"
                required
              />
            </div>
          </div>

          {/* Password Field with Show/Hide Toggle */}
          <div>
            <label className="block text-[#FFD21C] text-xs sm:text-sm font-semibold mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                className="w-full pl-10 pr-11 py-3 rounded-xl bg-gray-900/90 text-white text-xs sm:text-sm border border-gray-700 focus:border-[#FFD21C] focus:ring-1 focus:ring-[#FFD21C] outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-[#FFD21C] via-[#D4AF37] to-[#F59E0B] text-black font-extrabold text-sm sm:text-base hover:scale-[1.005] active:scale-[0.99] transition disabled:opacity-50 shadow-lg"
          >
            {loading ? "VERIFYING CREDENTIALS..." : "LOGIN TO PORTAL"}
          </button>
        </form>

        <p className="text-[11px] text-gray-500 text-center mt-6">
          © Good Luck India Marketing. All rights reserved.
        </p>

      </div>
    </div>
  );
}