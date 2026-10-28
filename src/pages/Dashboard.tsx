import { useEffect, useState } from "react";
import { db } from "../firebaseConfig"; // Adjust path if needed
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

interface UserProfile {
  userId: string;
  fullName: string;
  group: string;
  tokenNo: string;
  rank: string;
  referrerId: string;
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
  const [loading, setLoading] = useState<boolean>(true);

  // Replace with dynamic logged-in user ID (from Auth context / localStorage)
  const currentUserId = localStorage.getItem("activeUserId") || "MEM101";

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
          // Find how many levels up currentUserId is from this downline member
          const levelIndex = chain.indexOf(currentUserId);

          if (levelIndex >= 0 && levelIndex < 6) {
            levels[levelIndex] += 1;
            totalTeam += 1;
            if (levelIndex === 0) {
              directs += 1; // Direct Level 1 child
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
        <p className="text-xl font-semibold">Loading Dashboard Data...</p>
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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome, {userData?.fullName || "Member"} 👋
        </h1>
        <p className="text-gray-400 mt-1">Here's an overview of your account</p>
      </div>

      {/* Basic User Information */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <InfoItem label="Name" value={userData?.fullName || "N/A"} />
          <InfoItem label="ID" value={userData?.userId || "N/A"} />
          <InfoItem label="Current Group" value={userData?.group || "Group A"} />
          <InfoItem label="Token Number" value={userData?.tokenNo || "N/A"} />
        </div>
      </div>

      {/* Main Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <DashboardCard title="Renewal History" value={`₹${wallet.renewalIncome}`} />
        <DashboardCard title="Total Income" value={`₹${wallet.totalIncome}`} />
        <DashboardCard title="Wallet Balance" value={`₹${wallet.currentBalance}`} />
        <DashboardCard title="Total Direct" value={String(directCount)} />
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DashboardCard title="Total Team" value={String(totalTeamCount)} />
        <DashboardCard title="My Position" value="Level 1" />
      </div>

      {/* Income Section */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Income Summary</h2>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold mb-5">Wallet</h2>
          <div className="space-y-4">
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
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold mb-5">Account Details</h2>
          <div className="space-y-4">
            <Row label="Rank" value={userData?.rank || "Member"} />
            <Row label="Referrer" value={referrerName} />
            <Row label="Referrer ID" value={userData?.referrerId || "N/A"} />
          </div>
        </div>
      </div>

      {/* Team Levels */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-5">My Team Levels</h2>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-bold text-lg text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}

function SummaryItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-6 border-b md:border-b-0 md:border-r last:border-r-0 border-gray-200">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-200 pb-3">
      <span className="text-gray-500">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function LevelCard({ level, members }: { level: string; members: string }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 text-center">
      <p className="font-semibold text-gray-600">{level}</p>
      <p className="text-2xl font-bold mt-2">{members}</p>
      <p className="text-xs text-gray-500">Members</p>
    </div>
  );
}

export default Dashboard;