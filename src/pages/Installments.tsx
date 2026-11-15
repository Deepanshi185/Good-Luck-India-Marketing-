import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { CheckCircle2, Clock3 } from "lucide-react";

type MonthlyRecord = {
  month: number;
  amount: number;
  status: "Paid" | "Pending";
  date: string;
};

function Installments() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [installments, setInstallments] = useState<MonthlyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const activeUserId = localStorage.getItem("activeUserId") || "GLIM001";

  useEffect(() => {
    async function fetchInstallmentHistory() {
      try {
        setLoading(true);

        const userRef = doc(db, "users", activeUserId);
        const userSnap = await getDoc(userRef);

        const loadedRecords: MonthlyRecord[] = [];

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const monthlyPayments = userData.monthlyPayments || {};

          for (let m = 1; m <= 21; m++) {
            const record = monthlyPayments[m] || { paid: false, paidAt: null };
            loadedRecords.push({
              month: m,
              amount: 1000, // ₹1,000 per month
              status: record.paid ? "Paid" : "Pending",
              date: record.paidAt ? record.paidAt : "—",
            });
          }
        } else {
          for (let m = 1; m <= 21; m++) {
            loadedRecords.push({
              month: m,
              amount: 1000,
              status: "Pending",
              date: "—",
            });
          }
        }

        setInstallments(loadedRecords);
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
  const totalPaidAmount = paidCount * 1000;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px] text-gray-700">
        <p className="text-base font-semibold">Loading 21-Month Installment Records...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6 pb-8">
      
      {/* Header with high contrast */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Monthly Installments (21 Months)
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
          View your recurring monthly company payment history (₹1,000/mo)
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <SummaryCard title="Months Paid" value={`${paidCount} / 21`} />
        <SummaryCard title="Pending Months" value={pendingCount.toString()} />
        <SummaryCard title="Total Amount Paid" value={`₹${totalPaidAmount.toLocaleString("en-IN")}`} />
      </div>

      {/* Filter Header */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-gray-900">Installment Ledger</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Official company payment clearance updated by administration
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs sm:text-sm font-semibold text-gray-700">Filter:</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border border-gray-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#D4AF37] bg-white cursor-pointer"
            >
              <option value="All">All Months</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Installment Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black text-white text-xs sm:text-sm">
                <th className="px-4 sm:px-6 py-3.5 sm:py-4">Installment Month</th>
                <th className="px-4 sm:px-6 py-3.5 sm:py-4">Payment Date</th>
                <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-right">Amount</th>
                <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-center">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
              {filteredInstallments.length > 0 ? (
                filteredInstallments.map((item) => (
                  <tr key={item.month} className="hover:bg-gray-50 transition">
                    <td className="px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-gray-900">
                      Month {item.month}
                    </td>

                    <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-gray-600">
                      {item.date}
                    </td>

                    <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-right font-semibold text-gray-900">
                      ₹{item.amount.toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-center">
                      {item.status === "Paid" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          <CheckCircle2 size={14} /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                          <Clock3 size={14} /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500 text-xs sm:text-sm">
                    No installment records found matching current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Important Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5">
        <p className="font-semibold text-amber-900 text-xs sm:text-sm">Important Note</p>
        <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
          Monthly installment clearance and payment updates are managed directly by company administration.
        </p>
      </div>

    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-100">
      <p className="text-xs sm:text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1.5">{value}</p>
    </div>
  );
}

export default Installments;