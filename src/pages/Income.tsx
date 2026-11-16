import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Banknote, TrendingUp, Users, Award, ArrowUpRight } from "lucide-react";

type IncomeTransaction = {
  id: string;
  date: string;
  timestamp: number;
  fromUserId: string;
  fromUserName: string;
  level: string;
  type: string;
  amount: number;
};

function Income() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [transactions, setTransactions] = useState<IncomeTransaction[]>([]);
  const [walletStats, setWalletStats] = useState({
    totalIncome: 0,
    levelIncome: 0,
    renewalIncome: 0,
    currentBalance: 0,
  });
  const [loading, setLoading] = useState(true);

  const activeUserId = localStorage.getItem("activeUserId") || "GLIM001";

  useEffect(() => {
    async function fetchIncomeData() {
      try {
        setLoading(true);

        // 1. Fetch User Wallet Summary
        const userRef = doc(db, "users", activeUserId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const wallet = data.wallet || {};
          setWalletStats({
            totalIncome: wallet.totalIncome || 0,
            levelIncome: wallet.levelIncome || 0,
            renewalIncome: wallet.renewalIncome || 0,
            currentBalance: wallet.currentBalance || 0,
          });
        }

        // 2. Fetch Earned Income Transactions from Firestore
        const txQuery = query(
          collection(db, "transactions"),
          where("userId", "==", activeUserId)
        );
        const txSnap = await getDocs(txQuery);

        const loadedTx: IncomeTransaction[] = [];

        txSnap.forEach((docSnap) => {
          const tx = docSnap.data();
          // Only include credit/income records
          if (tx.amount > 0 && tx.type !== "withdrawal") {
            const rawDate = tx.createdAt?.toDate
              ? tx.createdAt.toDate()
              : tx.date
              ? new Date(tx.date)
              : new Date();

            loadedTx.push({
              id: docSnap.id,
              date: rawDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              timestamp: rawDate.getTime(),
              fromUserId: tx.fromUserId || tx.sourceUserId || "Team Member",
              fromUserName: tx.fromUserName || tx.description || "Referral Commission",
              level: tx.level ? `Level ${tx.level}` : tx.installmentNumber === 1 ? "Level 1" : "Team Level",
              type:
                tx.installmentNumber === 1
                  ? "Direct Referral"
                  : tx.installmentNumber === 2
                  ? "Level Income"
                  : tx.type || "Commission",
              amount: tx.amount || 0,
            });
          }
        });

        // Sort newest first
        loadedTx.sort((a, b) => b.timestamp - a.timestamp);
        setTransactions(loadedTx);
      } catch (err) {
        console.error("Error fetching income records:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchIncomeData();
  }, [activeUserId]);

  const filteredTransactions =
    selectedFilter === "All"
      ? transactions
      : transactions.filter((item) => item.type === selectedFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px] text-gray-700">
        <p className="text-base font-semibold">Loading Income & Commission Ledger...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-5 sm:space-y-6 pb-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          My Income & Commissions
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
          Track your direct referral bonuses, 6-level team earnings, and wallet credits
        </p>
      </div>

      {/* Top Income Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <IncomeStatCard
          title="Total Income Earned"
          value={`₹${walletStats.totalIncome.toLocaleString("en-IN")}`}
          subtitle="Lifetime earnings"
          icon={TrendingUp}
          accentColor="text-emerald-600 bg-emerald-50 border-emerald-200"
        />
        <IncomeStatCard
          title="Level & Team Income"
          value={`₹${walletStats.levelIncome.toLocaleString("en-IN")}`}
          subtitle="From downline network"
          icon={Users}
          accentColor="text-amber-700 bg-amber-50 border-amber-200"
        />
        <IncomeStatCard
          title="Renewal Income"
          value={`₹${walletStats.renewalIncome.toLocaleString("en-IN")}`}
          subtitle="Recurring bonuses"
          icon={Award}
          accentColor="text-blue-600 bg-blue-50 border-blue-200"
        />
        <IncomeStatCard
          title="Available Wallet"
          value={`₹${walletStats.currentBalance.toLocaleString("en-IN")}`}
          subtitle="Ready for withdrawal"
          icon={Banknote}
          accentColor="text-[#B8860B] bg-yellow-50 border-yellow-200"
        />
      </div>

      {/* Commission Structure Guide */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
          Commission Structure Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl p-4 bg-gradient-to-r from-emerald-50/80 to-white border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                1st Installment Bonus
              </span>
              <span className="text-lg font-extrabold text-emerald-700">₹200</span>
            </div>
            <p className="text-sm font-bold text-gray-900 mt-1">
              Direct Referral (Level 1)
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Credited instantly when your direct recruit completes their 1st installment.
            </p>
          </div>

          <div className="rounded-xl p-4 bg-gradient-to-r from-amber-50/80 to-white border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B8860B]">
                2nd Installment Bonus
              </span>
              <span className="text-sm font-extrabold text-[#B8860B]">
                L2: ₹100 • L3–L6: ₹50
              </span>
            </div>
            <p className="text-sm font-bold text-gray-900 mt-1">
              Multi-Level Team Income (Level 2 to Level 6)
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Distributed automatically across 5 upline levels upon downline 2nd installment clearance.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Ledger Header */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-gray-900">
              Income Transaction History
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Detailed breakdown of every commission credited to your account
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <label className="text-xs sm:text-sm font-semibold text-gray-700">Filter:</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border border-gray-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#D4AF37] bg-white text-gray-800 cursor-pointer"
            >
              <option value="All">All Earnings</option>
              <option value="Direct Referral">Direct Referral</option>
              <option value="Level Income">Level Income</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-900 text-white text-xs sm:text-sm">
                <th className="px-4 sm:px-6 py-3.5">Date</th>
                <th className="px-4 sm:px-6 py-3.5">From Member</th>
                <th className="px-4 sm:px-6 py-3.5">Level</th>
                <th className="px-4 sm:px-6 py-3.5">Income Type</th>
                <th className="px-4 sm:px-6 py-3.5 text-right">Credited Amount</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 sm:px-6 py-4 text-gray-600 whitespace-nowrap">
                      {tx.date}
                    </td>

                    <td className="px-4 sm:px-6 py-4">
                      <p className="font-bold text-gray-900">{tx.fromUserName}</p>
                      <p className="text-[11px] text-gray-500">{tx.fromUserId}</p>
                    </td>

                    <td className="px-4 sm:px-6 py-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 font-semibold text-xs">
                        {tx.level}
                      </span>
                    </td>

                    <td className="px-4 sm:px-6 py-4 text-gray-700 font-medium">
                      {tx.type}
                    </td>

                    <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                        <ArrowUpRight size={14} /> +₹{tx.amount.toLocaleString("en-IN")}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <p className="font-semibold text-gray-700">No income transactions yet</p>
                    <p className="text-xs mt-1">
                      Commissions will appear here automatically as your team members complete their installments.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

/* ---------------- Stat Card Component ---------------- */

function IncomeStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  accentColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200 flex items-start justify-between">
      <div>
        <p className="text-xs sm:text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-extrabold text-gray-900 mt-1.5">{value}</p>
        <p className="text-[11px] text-gray-400 mt-1">{subtitle}</p>
      </div>
      <div className={`p-2.5 rounded-xl border ${accentColor}`}>
        <Icon size={20} />
      </div>
    </div>
  );
}

export default Income;