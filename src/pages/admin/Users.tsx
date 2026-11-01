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
import emailjs from "@emailjs/browser";

// EmailJS Credentials
const EMAILJS_SERVICE_ID = "service_33lpf3o";
const EMAILJS_TEMPLATE_ID = "template_2ncoupi";
const EMAILJS_PUBLIC_KEY = "YX13aDAzp4kU5PYRC";

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

      // 1. Save user to Firebase Firestore
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

      // 2. Send automatic credentials email to member via EmailJS
      let emailSent = false;
      try {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            to_name: formData.fullName,
            to_email: formData.email,
            user_id: finalUserId,
            password: formData.password,
            mobile: formData.mobile,
          },
          EMAILJS_PUBLIC_KEY
        );
        emailSent = true;
      } catch (emailErr) {
        console.error("Member created, but failed to send email:", emailErr);
      }

      setStatusMessage({
        text: `Member registered successfully! User ID: ${finalUserId}.${
          emailSent
            ? ` Credentials sent to ${formData.email}`
            : " (Email notification could not be delivered)"
        }`,
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
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 md:p-6 overflow-x-hidden">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8">
        
        {/* Header */}
        <div className="border-b border-gray-100 pb-4 mb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Register Member
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Create a new member account and auto-send login credentials
          </p>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div
            className={`p-3.5 sm:p-4 rounded-xl text-center mb-6 font-semibold text-xs sm:text-sm ${
              statusMessage.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Personal Information Card */}
          <div className="bg-gray-50/70 p-3.5 sm:p-5 rounded-xl border border-gray-100">
            <h2 className="text-xs sm:text-sm font-bold text-[#D4AF37] tracking-wide uppercase mb-3 sm:mb-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                  className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Credentials will be sent here"
                  className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] bg-white"
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
                  placeholder="Enter PAN number"
                  className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] bg-white"
                />
              </div>
            </div>
          </div>

          {/* Referral & Security Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Referral Section */}
            <div className="bg-gray-50/70 p-3.5 sm:p-5 rounded-xl border border-gray-100">
              <h2 className="text-xs sm:text-sm font-bold text-[#D4AF37] tracking-wide uppercase mb-3">
                Referral Details
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
                  placeholder="Referrer ID (Leave blank if top level)"
                  className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] bg-white"
                />
              </div>
            </div>

            {/* Login Security Section */}
            <div className="bg-gray-50/70 p-3.5 sm:p-5 rounded-xl border border-gray-100">
              <h2 className="text-xs sm:text-sm font-bold text-[#D4AF37] tracking-wide uppercase mb-3">
                Login Security
              </h2>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Temporary Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create initial password"
                  className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] bg-white"
                  required
                />
              </div>
            </div>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FFD21C] to-[#F59E0B] text-black font-bold text-sm sm:text-base hover:scale-[1.005] active:scale-[0.99] transition disabled:opacity-50 shadow-md"
          >
            {loading ? "REGISTERING & SENDING EMAIL..." : "REGISTER USER"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddUser;