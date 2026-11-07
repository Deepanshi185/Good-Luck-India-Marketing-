import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Users, UserPlus, CreditCard, ArrowDownRight, Wallet, ShieldCheck } from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminAccounts: 0,
    totalIncome: 0,
    totalPayments: 0,
    paidPayments: 0,
    pendingPayments: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    completedWithdrawals: 0,
    levelCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } as Record<number, number>,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      // 1. Fetch Users Data from Firestore
      const usersSnap = await getDocs(collection(db, "users"));
      let total = 0;
      let active = 0;
      let admins = 0;
      let incomeSum = 0;
      let paidCount = 0;
      let pendingCount = 0;
      const levels: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

      usersSnap.forEach((docSnap) => {
        total++;
        const data = docSnap.data();

        if (data.role === "admin") {
          admins++;
        } else {
          active++;
        }

        // Sum income from wallet
        if (data.wallet?.totalIncome) {
          incomeSum += Number(data.wallet.totalIncome) || 0;
        } else if (data.wallet?.currentBalance) {
          incomeSum += Number(data.wallet.currentBalance) || 0;
        }

        // Calculate 6-level referral distribution
        const chainLength = (data.uplineChain || []).length;
        if (chainLength >= 1 && chainLength <= 6) {
          levels[chainLength] = (levels[chainLength] || 0) + 1;
        }

        // Installment counts
        if (data.installments) {
          Object.values(data.installments).forEach((inst: any) => {
            if (inst?.paid) paidCount++;
            else pendingCount++;
          });
        }
      });

      // 2. Fetch Withdrawal Requests Data (if collection exists)
      let totalW = 0;
      let pendingW = 0;
      let completedW = 0;

      try {
        const withdrawalsSnap = await getDocs(collection(db, "withdrawals"));
        withdrawalsSnap.forEach((docSnap) => {
          totalW++;
          const wData = docSnap.data();
          if (wData.status === "approved" || wData.status === "completed") {
            completedW++;
          } else if (wData.status === "pending") {
            pendingW++;
          }
        });
      } catch (wErr) {
        // Fallback if collection isn't populated yet
      }

      setStats({
        totalUsers: total,
        activeUsers: active,
        adminAccounts: admins,
        totalIncome: incomeSum,
        totalPayments: paidCount + pendingCount,
        paidPayments: paidCount,
        pendingPayments: pendingCount,
        totalWithdrawals: totalW,
        pendingWithdrawals: pendingW,
        completedWithdrawals: completedW,
        levelCounts: levels,
      });
    } catch (err) {
      console.error("Error fetching dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px] text-white font-semibold text-sm sm:text-base">
        Loading Admin Dashboard Statistics...
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Admin Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Real-time overview of company members, income, and activities
        </p>
      </div>

      {/* Main Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
        <DashboardCard
          title="Total Registered Users"
          value={stats.totalUsers.toString()}
          icon={<Users className="text-[#D4AF37]" size={22} />}
        />
        <DashboardCard
          title="Active Members"
          value={stats.activeUsers.toString()}
          icon={<ShieldCheck className="text-green-600" size={22} />}
        />
        <DashboardCard
          title="Admin Accounts"
          value={stats.adminAccounts.toString()}
          icon={<ShieldCheck className="text-purple-600" size={22} />}
        />
        <DashboardCard
          title="Total Income"
          value={`₹${stats.totalIncome.toLocaleString("en-IN")}`}
          icon={<Wallet className="text-amber-500" size={22} />}
        />
      </div>

      {/* Payment & Withdrawal Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <DashboardSection title="Payment Overview">
          <DashboardRow
            label="Total Payments Tracked"
            value={stats.totalPayments.toString()}
          />
          <DashboardRow
            label="Cleared Payments"
            value={stats.paidPayments.toString()}
          />
          <DashboardRow
            label="Pending Installments"
            value={stats.pendingPayments.toString()}
          />
        </DashboardSection>

        <DashboardSection title="Withdrawal Overview">
          <DashboardRow
            label="Total Withdrawal Requests"
            value={stats.totalWithdrawals.toString()}
          />
          <DashboardRow
            label="Pending Approvals"
            value={stats.pendingWithdrawals.toString()}
          />
          <DashboardRow
            label="Completed Payouts"
            value={stats.completedWithdrawals.toString()}
          />
        </DashboardSection>
      </div>

      {/* Team Level Overview */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
        <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5">
          6-Level Referral Breakdown
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          <LevelCard level="Level 1" members={stats.levelCounts[1] || 0} />
          <LevelCard level="Level 2" members={stats.levelCounts[2] || 0} />
          <LevelCard level="Level 3" members={stats.levelCounts[3] || 0} />
          <LevelCard level="Level 4" members={stats.levelCounts[4] || 0} />
          <LevelCard level="Level 5" members={stats.levelCounts[5] || 0} />
          <LevelCard level="Level 6" members={stats.levelCounts[6] || 0} />
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
        <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/admin/add-user")}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-gradient-to-r from-[#FFD21C] to-[#F59E0B] text-black font-bold text-xs sm:text-sm hover:scale-[1.01] active:scale-[0.99] transition shadow-sm"
          >
            <UserPlus size={18} />
            Add New User
          </button>

          <button
            onClick={() => navigate("/admin/payments")}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-gray-300 text-gray-800 font-semibold text-xs sm:text-sm hover:bg-gray-50 transition"
          >
            <CreditCard size={18} />
            Manage Payments
          </button>

          <button
            onClick={() => navigate("/admin/withdrawals")}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-gray-300 text-gray-800 font-semibold text-xs sm:text-sm hover:bg-gray-50 transition"
          >
            <ArrowDownRight size={18} />
            Withdrawal Requests
          </button>
        </div>
      </div>

    </div>
  );
}

/* ---------------- Stat Cards & Components ---------------- */

function DashboardCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 font-medium">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
          {value}
        </p>
      </div>
      <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
    </div>
  );
}

function DashboardSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
      <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-4">
        {title}
      </h2>
      <div className="space-y-3 sm:space-y-4">{children}</div>
    </div>
  );
}

function DashboardRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-gray-100 pb-2.5 text-xs sm:text-sm">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}

function LevelCard({ level, members }: { level: string; members: number }) {
  return (
    <div className="border border-gray-200 rounded-xl p-3 text-center bg-gray-50/50">
      <p className="font-semibold text-xs text-gray-600">{level}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
        {members}
      </p>
      <p className="text-[10px] sm:text-xs text-gray-400">Members</p>
    </div>
  );
}

export default AdminDashboard;