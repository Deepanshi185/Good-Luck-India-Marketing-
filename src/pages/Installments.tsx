import { useEffect, useState } from "react";
import { db } from "../firebaseConfig"; // Adjust relative path if needed
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

type InstallmentItem = {
  installment: number;
  date: string;
  id: string;
  name: string;
  amount: number;
  status: "Paid" | "Pending";
  income: number;
};

function Installments() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [installments, setInstallments] = useState<InstallmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active logged in user ID from session/localstorage (defaults to MEM101 for testing)
  const activeUserId = localStorage.getItem("activeUserId") || "MEM101";

  useEffect(() => {
    async function fetchInstallmentHistory() {
      try {
        setLoading(true);

        // 1. Fetch user profile to check installment payment status
        const userRef = doc(db, "users", activeUserId);
        const userSnap = await getDoc(userRef);

        const loadedInstallments: InstallmentItem[] = [];

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const userInstallments = userData.installments || {};

          // Fetch earned income transactions linked to this member
          const txQuery = query(
            collection(db, "transactions"),
            where("userId", "==", activeUserId)
          );
          const txSnap = await getDocs(txQuery);
          
          let inst1Income = 0;
          let inst2Income = 0;

          txSnap.forEach((txDoc) => {
            const tx = txDoc.data();
            if (tx.installmentNumber === 1) inst1Income += tx.amount || 0;
            if (tx.installmentNumber === 2) inst2Income += tx.amount || 0;
          });

          // Build Installment 1 Record
          const inst1 = userInstallments[1] || { paid: false, paidAt: null };
          loadedInstallments.push({
            installment: 1,
            date: inst1.paidAt
              ? new Date(inst1.paidAt).toLocaleDateString("en-IN")
              : "Pending",
            id: userData.userId || activeUserId,
            name: userData.fullName || "Member",
            amount: 500, // Monthly installment amount
            status: inst1.paid ? "Paid" : "Pending",
            income: inst1Income,
          });

          // Build Installment 2 Record
          const inst2 = userInstallments[2] || { paid: false, paidAt: null };
          loadedInstallments.push({
            installment: 2,
            date: inst2.paidAt
              ? new Date(inst2.paidAt).toLocaleDateString("en-IN")
              : "Pending",
            id: userData.userId || activeUserId,
            name: userData.fullName || "Member",
            amount: 500,
            status: inst2.paid ? "Paid" : "Pending",
            income: inst2Income,
          });
        }

        setInstallments(loadedInstallments);
      } catch (err) {
        console.error("Error fetching installment history:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchInstallmentHistory();
  }, [activeUserId]);

  const filteredInstallments =
    selectedFilter === "All"
      ? installments
      : installments.filter((item) => item.status === selectedFilter);

  const paidCount = installments.filter((item) => item.status === "Paid").length;
  const pendingCount = installments.filter((item) => item.status === "Pending").length;
  const totalIncome = installments.reduce((total, item) => total + item.income, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-white">
        <p className="text-lg font-semibold">Loading Installment Records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Monthly Installments</h1>
        <p className="text-gray-400 mt-1">
          View your installment history and earned referral incomes
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <SummaryCard title="Paid Installments" value={paidCount.toString()} />
        <SummaryCard title="Pending Installments" value={pendingCount.toString()} />
        <SummaryCard title="Income Generated" value={`₹${totalIncome}`} />
      </div>

      {/* Income Rule Information */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Income Distribution Rules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Installment */}
          <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-green-50 to-white">
            <p className="text-sm font-semibold text-gray-500">1st Installment</p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              Level 1 (Direct Referral)
            </p>
            <p className="text-2xl font-bold text-green-600 mt-2">₹200</p>
            <p className="text-xs text-gray-500 mt-1">
              Credited to immediate referrer upon downline 1st payment.
            </p>
          </div>

          {/* Second Installment */}
          <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-blue-50 to-white">
            <p className="text-sm font-semibold text-gray-500">2nd Installment</p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              Level 2 – Level 6 Team Incomes
            </p>
            <p className="text-sm font-bold text-blue-700 mt-2">
              L2: ₹100 · L3: ₹50 · L4: ₹50 · L5: ₹50 · L6: ₹50
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Distributed across upline parent accounts upon 2nd payment.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Installment History</h2>
            <p className="text-sm text-gray-500 mt-1">
              Track official payment clearance from administration
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="font-semibold text-gray-700">Filter:</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#D4AF37]"
            >
              <option value="All">All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Installment Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-black text-white">
                <th className="px-6 py-4 text-left">Installment</th>
                <th className="px-6 py-4 text-left">Payment Date</th>
                <th className="px-6 py-4 text-left">ID No.</th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Earned Income</th>
              </tr>
            </thead>

            <tbody>
              {filteredInstallments.length > 0 ? (
                filteredInstallments.map((item, index) => (
                  <tr
                    key={`${item.id}-${item.installment}-${index}`}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {item.installment === 1
                        ? "1st Installment"
                        : "2nd Installment"}
                    </td>

                    <td className="px-6 py-4 text-gray-600">{item.date}</td>

                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {item.id}
                    </td>

                    <td className="px-6 py-4 text-gray-800">{item.name}</td>

                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      ₹{item.amount}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          item.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right font-bold text-green-600">
                      {item.income > 0 ? `₹${item.income}` : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No installment records found matching current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Important Note */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-5">
        <p className="font-semibold text-yellow-800">Important Note</p>
        <p className="text-sm text-yellow-700 mt-1">
          Payment clearance and status updates are managed directly by company administration.
          Members cannot manually alter installment clearance status.
        </p>
      </div>
    </div>
  );
}

/* ---------------- Summary Card Component ---------------- */

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}

export default Installments;