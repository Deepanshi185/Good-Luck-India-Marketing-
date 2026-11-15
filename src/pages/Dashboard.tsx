import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

interface UserProfile {
  userId: string;
  fullName: string;
  rank: string;
  referrerId: string;
  uplineChain?: string[];
  wallet: {
    currentBalance: number;
    totalIncome: number;
    renewalIncome: number;
    levelIncome: number;
    holdBalance: number;
  };
}

function Dashboard() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [referrerName, setReferrerName] = useState<string>("N/A");
  const [directCount, setDirectCount] = useState<number>(0);
  const [totalTeamCount, setTotalTeamCount] = useState<number>(0);
  const [levelCounts, setLevelCounts] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [userLevelPosition, setUserLevelPosition] = useState<string>("Top Level");
  const [loading, setLoading] = useState<boolean>(true);

  const currentUserId = localStorage.getItem("activeUserId") || "GLIM001";

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // 1. Fetch current user document
        const userRef = doc(db, "users", currentUserId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data() as UserProfile;
          setUserData(data);

          // Calculate User's own Level Position based on their uplineChain length
          const chainLength = (data.uplineChain || []).length;
          if (chainLength > 0) {
            setUserLevelPosition(`Level ${chainLength + 1}`);
          } else {
            setUserLevelPosition("Top Level (Root)");
          }

          // Fetch Referrer Name if referrerId exists
          if (data.referrerId) {
            const refSnap = await getDoc(doc(db, "users", data.referrerId));
            if (refSnap.exists()) {
              setReferrerName(refSnap.data().fullName || data.referrerId);
            }
          }
        }

        // 2. Fetch downline team members (where uplineChain contains currentUserId)
        const teamQuery = query(
          collection(db, "users"),
          where("uplineChain", "array-contains", currentUserId)
        );
        const querySnapshot = await getDocs(teamQuery);

        let directs = 0;
        let totalTeam = 0;
        const levels = [0, 0, 0, 0, 0, 0];

        querySnapshot.forEach((docSnap) => {
          const member = docSnap.data();
          const chain: string[] = member.uplineChain || [];
          
          // Find how many levels down currentUserId is from this member
          const myIndexInChain = chain.indexOf(currentUserId);

          if (myIndexInChain !== -1) {
            // The level of this downline member relative to currentUserId
            // If currentUserId is at index X in downline's uplineChain, 
            // that member is at level: (chain.length - X)
            const relativeLevel = chain.length - myIndexInChain;

            if (relativeLevel >= 1 && relativeLevel <= 6) {
              levels[relativeLevel - 1] += 1;
              totalTeam += 1;
              if (relativeLevel === 1) {
                directs += 1; // Direct Level 1 child
              }
            }
          }
        });

        setDirectCount(directs);
        setTotalTeamCount(totalTeam);
        setLevelCounts(levels);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [currentUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white">
        <p className="text-base sm:text-xl font-semibold">Loading Dashboard Data...</p>
      </div>
    );
  }

  const wallet = userData?.wallet || {
    currentBalance: 0,
    totalIncome: 0,
    renewalIncome: 0,
    levelIncome: 0,
    holdBalance: 0,
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6">
      
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Welcome, {userData?.fullName || "Member"} 👋
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">Here's an overview of your account</p>
      </div>

      {/* Basic User Information (Group & Token Number Removed) */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-100">
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <InfoItem label="Name" value={userData?.fullName || "N/A"} />
          <InfoItem label="ID No." value={userData?.userId || "N/A"} />
        </div>
      </div>

      {/* Main Dashboard Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
        <DashboardCard title="Renewal History" value={`₹${wallet.renewalIncome}`} />
        <DashboardCard title="Total Income" value={`₹${wallet.totalIncome}`} />
        <DashboardCard title="Wallet Balance" value={`₹${wallet.currentBalance}`} />
        <DashboardCard title="Total Direct" value={String(directCount)} />
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
        <DashboardCard title="Total Team" value={String(totalTeamCount)} />
        <DashboardCard title="My Position" value={userLevelPosition} />
      </div>

      {/* Income Section */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Income Summary</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3">
          <SummaryItem
            title="Total Income History"
            value={`₹${wallet.totalIncome}`}
          />
          <SummaryItem
            title="Renewal Income"
            value={`₹${wallet.renewalIncome}`}
          />
          <SummaryItem
            title="Level Income"
            value={`₹${wallet.levelIncome}`}
          />
        </div>
      </div>

      {/* Wallet & Account Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Wallet */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Wallet</h2>
          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
            <Row
              label="Current Wallet Balance"
              value={`₹${wallet.currentBalance}`}
            />
            <Row
              label="Hold Wallet Balance"
              value={`₹${wallet.holdBalance}`}
            />
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Account Details</h2>
          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
            <Row label="Rank" value={userData?.rank || "Member"} />
            <Row label="Referrer" value={referrerName} />
            <Row label="Referrer ID" value={userData?.referrerId || "N/A"} />
          </div>
        </div>
      </div>

      {/* Team Levels */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">My Team Levels</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          <LevelCard level="Level 1" members={String(levelCounts[0])} />
          <LevelCard level="Level 2" members={String(levelCounts[1])} />
          <LevelCard level="Level 3" members={String(levelCounts[2])} />
          <LevelCard level="Level 4" members={String(levelCounts[3])} />
          <LevelCard level="Level 5" members={String(levelCounts[4])} />
          <LevelCard level="Level 6" members={String(levelCounts[5])} />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs sm:text-sm text-gray-500">{label}</p>
      <p className="font-bold text-base sm:text-lg text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-100">
      <p className="text-gray-500 text-xs sm:text-sm">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1.5">{value}</p>
    </div>
  );
}

function SummaryItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-4 sm:p-6 border-b md:border-b-0 md:border-r last:border-r-0 border-gray-200">
      <p className="text-gray-500 text-xs sm:text-sm">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1.5">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-2.5 text-xs sm:text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}

function LevelCard({ level, members }: { level: string; members: string }) {
  return (
    <div className="border border-gray-200 rounded-xl p-3 sm:p-4 text-center bg-gray-50/50">
      <p className="font-semibold text-gray-600 text-xs sm:text-sm">{level}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1.5">{members}</p>
      <p className="text-[11px] sm:text-xs text-gray-500">Members</p>
    </div>
  );
}

export default Dashboard;