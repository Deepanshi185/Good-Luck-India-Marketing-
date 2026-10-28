import { useState } from "react";
import { db } from "../../firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

function AddUser() {
  const [formData, setFormData] = useState({
    userId: "",
    group: "",
    referralId: "",
    fullName: "",
    email: "",
    mobile: "",
    pan: "",
    tokenNo: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
          throw new Error(`Referral ID "${formData.referralId}" does not exist in the database.`);
        }

        const referrerData = referrerSnap.data();
        uplineChain = [
          formData.referralId.trim(),
          ...(referrerData.uplineChain || []),
        ].slice(0, 6);
      }

      // Generate ID if empty
      const finalUserId = formData.userId.trim() || `MEM${Math.floor(1000 + Math.random() * 9000)}`;

      // Save user to Firebase Firestore
      await setDoc(doc(db, "users", finalUserId), {
        userId: finalUserId,
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        pan: formData.pan,
        referrerId: formData.referralId.trim() || null,
        uplineChain: uplineChain,
        group: formData.group,
        tokenNo: formData.tokenNo,
        rank: "Member",
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
        group: "",
        referralId: "",
        fullName: "",
        email: "",
        mobile: "",
        pan: "",
        tokenNo: "",
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
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Member</h1>
      <p className="text-gray-500 mb-6">Create a new member account in the system</p>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-center mb-6 font-semibold ${
            statusMessage.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div>
          <h2 className="text-lg font-bold text-[#D4AF37] mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID (Optional)</label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="e.g. MEM101 (Auto-generated if blank)"
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN</label>
              <input
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                placeholder="Enter PAN"
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* Membership Information */}
        <div>
          <h2 className="text-lg font-bold text-[#D4AF37] mb-4">Membership Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Group</label>
              <select
                name="group"
                value={formData.group}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-[#D4AF37]"
                required
              >
                <option value="">-- Select Group --</option>
                <option value="Group A">Group A</option>
                <option value="Group B">Group B</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referral ID</label>
              <input
                type="text"
                name="referralId"
                value={formData.referralId}
                onChange={handleChange}
                placeholder="Enter referrer User ID (Leave empty if top level)"
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* Login Information */}
        <div>
          <h2 className="text-lg font-bold text-[#D4AF37] mb-4">Login Information</h2>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create password"
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-[#D4AF37]"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#FFD21C] to-[#F59E0B] text-black font-bold text-lg hover:scale-[1.01] transition disabled:opacity-50"
        >
          {loading ? "REGISTERING..." : "REGISTER USER"}
        </button>
      </form>
    </div>
  );
}

export default AddUser;