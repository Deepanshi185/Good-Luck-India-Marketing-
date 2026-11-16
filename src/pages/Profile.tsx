import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Building2,
  ShieldCheck,
  Edit3,
  Hash,
  Users,
} from "lucide-react";

interface UserProfileData {
  userId: string;
  fullName: string;
  email: string;
  mobile: string;
  pan: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankDetails?: string;
  referrerId?: string;
  rank?: string;
  status?: string;
}

function Profile() {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const activeUserId = localStorage.getItem("activeUserId") || "GLIM001";

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const userRef = doc(db, "users", activeUserId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const formattedBank =
            data.bankName && data.accountNumber
              ? `${data.bankName} (A/C: ${data.accountNumber}${
                  data.ifscCode ? ` • IFSC: ${data.ifscCode}` : ""
                })`
              : data.bankDetails || "Not Added";

          setUser({
            userId: data.userId || activeUserId,
            fullName: data.fullName || "Member",
            email: data.email || "Not Provided",
            mobile: data.mobile || "Not Provided",
            pan: data.pan || "Not Provided",
            bankDetails: formattedBank,
            referrerId: data.referrerId || "Top Level (Direct)",
            rank: data.rank || "Member",
            status: data.status || "Active",
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [activeUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px] text-gray-700">
        <p className="text-base font-semibold">Loading Profile Details...</p>
      </div>
    );
  }

  const displayName = user?.fullName || "Member";

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-5 sm:space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            My Profile
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
            View your registered personal, KYC, and banking details
          </p>
        </div>

        <button
          onClick={() => navigate("/edit-profile")}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-xs sm:text-sm font-semibold hover:bg-gray-800 transition shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Edit3 size={16} className="text-[#FFD21C]" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-[#FFD21C] via-[#F59E0B] to-[#D97706] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-900 flex items-center justify-center shadow-lg shrink-0">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#FFD21C]">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950">
                  {displayName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-900 text-[#FFD21C]">
                  <ShieldCheck size={13} /> {user?.status || "Active"}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-bold text-gray-900/80">
                Member ID: <span className="text-gray-950">{user?.userId}</span> •{" "}
                {user?.rank || "Member"}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-5 sm:p-8">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
            Account & KYC Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <ProfileDetailBox
              icon={Hash}
              label="Member ID"
              value={user?.userId || "N/A"}
            />
            <ProfileDetailBox
              icon={User}
              label="Full Name"
              value={displayName}
            />
            <ProfileDetailBox
              icon={Mail}
              label="Email Address"
              value={user?.email || "Not Provided"}
            />
            <ProfileDetailBox
              icon={Phone}
              label="Mobile Number"
              value={user?.mobile || "Not Provided"}
            />
            <ProfileDetailBox
              icon={Users}
              label="Sponsor / Referrer ID"
              value={user?.referrerId || "Top Level"}
            />
            <ProfileDetailBox
              icon={CreditCard}
              label="PAN Card Number"
              value={user?.pan || "Not Provided"}
            />
            <div className="md:col-span-2">
              <ProfileDetailBox
                icon={Building2}
                label="Bank Account Details"
                value={user?.bankDetails || "Not Added"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileDetailBox({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3.5 p-4 rounded-xl bg-gray-50 border border-gray-200/80">
      <div className="p-2.5 rounded-lg bg-white border border-gray-200 text-[#B8860B] shrink-0">
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm sm:text-base font-bold text-gray-900 mt-0.5 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

export default Profile;