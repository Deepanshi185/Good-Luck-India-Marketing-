import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function EditProfile() {
  const activeUserId = localStorage.getItem("activeUserId") || "dnoenw1";

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  const [formData, setFormData] = useState({
    userId: activeUserId,
    fullName: "",
    email: "",
    mobile: "",
    pan: "",
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  });

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        const userRef = doc(db, "users", activeUserId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const bank = data.bankDetails || {};

          setFormData({
            userId: data.userId || activeUserId,
            fullName: data.fullName || "",
            email: data.email || "",
            mobile: data.mobile || "",
            pan: data.pan || "",
            accountHolder: bank.accountHolder || data.fullName || "",
            bankName: bank.bankName || "",
            accountNumber: bank.accountNumber || "",
            ifscCode: bank.ifscCode || "",
          });

          // Permanent 1-time lock check
          if (data.isProfileEdited === true) {
            setIsEditing(false);
            setIsLocked(true);
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [activeUserId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (isLocked) return;

    setLoading(true);
    setMessage(null);

    try {
      const userRef = doc(db, "users", activeUserId);

      await updateDoc(userRef, {
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        pan: formData.pan,
        bankDetails: {
          accountHolder: formData.accountHolder,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
        },
        isProfileEdited: true, // Permanent lock flag in database
      });

      setIsEditing(false);
      setIsLocked(true);
      setMessage({
        text: "Profile updated successfully! Your information is now locked.",
        type: "success",
      });
    } catch (err: any) {
      setMessage({
        text: err.message || "Failed to update profile.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white">
        <p className="text-xl font-semibold">Loading Profile Details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
        <p className="text-gray-400 mt-1">Update your personal information</p>
      </div>

      {/* Form Card */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        {/* Warning Banner */}
        {isLocked ? (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-8">
            <p className="font-semibold text-amber-800">
              🔒 Profile Locked permanently.
            </p>
            <p className="text-sm text-amber-700 mt-1">
              You have used your 1-time profile edit permission. Contact admin for any further changes.
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-8">
            <p className="font-semibold text-yellow-800">
              ⚠️ Profile information can be edited only once.
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Please make sure all information is correct before saving.
            </p>
          </div>
        )}

        {message && (
          <div
            className={`p-4 rounded-xl text-center mb-6 font-semibold ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* User ID */}
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-gray-800">
            User ID
          </label>
          <input
            type="text"
            value={formData.userId}
            disabled
            className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">User ID cannot be changed.</p>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Name"
            value={formData.fullName}
            onChange={(val) => handleInputChange("fullName", val)}
            disabled={!isEditing}
          />

          <InputField
            label="Email ID"
            value={formData.email}
            type="email"
            onChange={(val) => handleInputChange("email", val)}
            disabled={!isEditing}
          />

          <InputField
            label="Mobile"
            value={formData.mobile}
            type="tel"
            onChange={(val) => handleInputChange("mobile", val)}
            disabled={!isEditing}
          />

          <InputField
            label="PAN"
            value={formData.pan}
            onChange={(val) => handleInputChange("pan", val)}
            disabled={!isEditing}
          />
        </div>

        {/* Bank Details */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Bank Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Account Holder Name"
              value={formData.accountHolder}
              onChange={(val) => handleInputChange("accountHolder", val)}
              disabled={!isEditing}
            />

            <InputField
              label="Bank Name"
              value={formData.bankName}
              onChange={(val) => handleInputChange("bankName", val)}
              disabled={!isEditing}
            />

            <InputField
              label="Account Number"
              value={formData.accountNumber}
              onChange={(val) => handleInputChange("accountNumber", val)}
              disabled={!isEditing}
            />

            <InputField
              label="IFSC Code"
              value={formData.ifscCode}
              onChange={(val) => handleInputChange("ifscCode", val)}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            disabled={!isEditing || loading}
            onClick={handleSaveChanges}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#FFD21C] to-[#C99420] text-black font-bold hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* After Saving */}
        {isLocked && (
          <div className="mt-5 bg-green-50 border border-green-300 rounded-xl p-4">
            <p className="font-semibold text-green-800">
              ✓ Profile updated successfully.
            </p>
            <p className="text-sm text-green-700 mt-1">
              Your profile can no longer be edited.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block font-semibold mb-2 text-gray-800">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37] disabled:bg-gray-100 disabled:text-gray-500"
      />
    </div>
  );
}

export default EditProfile;