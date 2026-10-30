import { useState } from "react";
import { db } from "../../firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

function AddUser() {
  const [formData, setFormData] = useState({
    userId: "",
    referralId: "",
    fullName: "",
    email: "",
    mobile: "",
    pan: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Helper function to auto-generate sequential IDs like GLIM001, GLIM002...
  const generateSequentialUserId = async (): Promise<string> => {
    const querySnapshot = await getDocs(collection(db, "users"));
    let maxNumber = 0;

    querySnapshot.forEach((docSnap) => {
      const id = docSnap.id.toUpperCase();
      if (id.startsWith("GLIM")) {
        const numPart = parseInt(id.replace("GLIM", ""), 10);
        if (!isNaN(numPart) && numPart > maxNumber) {
          maxNumber = numPart;
        }
      }
    });

    const nextNumber = maxNumber + 1;
    return `GLIM${String(nextNumber).padStart(3, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      let uplineChain: string[] = [];

      // Build 6-level referral upline if Referral ID is provided
      if (formData.referralId.trim() !== "") {
        const referrerRef = doc(db, "users", formData.referralId.trim());
        const referrerSnap = await getDoc(referrerRef);

        if (!referrerSnap.exists()) {
          throw new Error(
            `Referral ID "${formData.referralId}" does not exist in database.`
          );
        }

        const referrerData = referrerSnap.data();
        uplineChain = [
          formData.referralId.trim(),
          ...(referrerData.uplineChain || []),
        ].slice(0, 6);
      }

      // Generate sequential ID if left blank
      const finalUserId =
        formData.userId.trim().toUpperCase() ||
        (await generateSequentialUserId());

      // Save user to Firebase Firestore
      await setDoc(doc(db, "users", finalUserId), {
        userId: finalUserId,
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        pan: formData.pan.trim() || "N/A",
        referrerId: formData.referralId.trim() || null,
        uplineChain: uplineChain,
        role: "member",
        isProfileEdited: false,
        wallet: {
          currentBalance: 0,
          totalIncome: 0,
          renewalIncome: 0,
          levelIncome: 0,
          holdBalance: 0,
        },
        installments: {
          1: { paid: false, paidAt: null },
          2: { paid: false, paidAt: null },
        },
        createdAt: serverTimestamp(),
      });

      setStatusMessage({
        text: `Member registered successfully! Assigned User ID: ${finalUserId}`,
        type: "success",
      });

      setFormData({
        userId: "",
        referralId: "",
        fullName: "",
        email: "",
        mobile: "",
        pan: "",
        password: "",
      });
    } catch (err: any) {
      setStatusMessage({
        text: err.message || "Failed to register member.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden p-2 sm:p-4 md:p-6">
      <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
          Register Member
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mb-6">
          Create a new member account in the system
        </p>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-center mb-6 font-semibold text-xs sm:text-sm ${
              statusMessage.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Information */}
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#D4AF37] mb-3">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  User ID (Optional)
                </label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="Auto-generated if blank (e.g. GLIM001)"
                  className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email ID
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  PAN Details (Optional)
                </label>
                <input
                  type="text"
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  placeholder="Enter PAN number (Optional)"
                  className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* Referral Information */}
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#D4AF37] mb-3">
              Referral Information
            </h2>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Referral ID
              </label>
              <input
                type="text"
                name="referralId"
                value={formData.referralId}
                onChange={handleChange}
                placeholder="Enter referrer User ID (Leave empty if top level)"
                className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Login Security */}
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#D4AF37] mb-3">
              Login Security
            </h2>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Temporary Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create initial password"
                className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#FFD21C] to-[#F59E0B] text-black font-bold text-sm sm:text-base hover:scale-[1.01] transition disabled:opacity-50"
          >
            {loading ? "REGISTERING..." : "REGISTER USER"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddUser;