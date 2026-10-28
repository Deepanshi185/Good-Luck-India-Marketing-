import { useState, useEffect } from "react";
import { db } from "../firebaseConfig"; // Adjust relative path if needed
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

type WithdrawalRecord = {
  id: string;
  date: string;
  amount: number;
  status: "Pending" | "Approved" | "Paid" | "Rejected";
};

function Withdraw() {
  const activeUserId = localStorage.getItem("activeUserId") || "dnoenw1";

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [history, setHistory] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const minimumWithdrawal = 100;

  useEffect(() => {
    fetchWithdrawalData();
  }, [activeUserId]);

  async function fetchWithdrawalData() {
    try {
      setLoading(true);

      // 1. Fetch live balance from user doc
      const userSnap = await getDoc(doc(db, "users", activeUserId));
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setWalletBalance(userData.wallet?.currentBalance || 0);
      }

      // 2. Fetch withdrawal history for this user
      const q = query(
        collection(db, "withdrawals"),
        where("userId", "==", activeUserId)
      );
      const querySnapshot = await getDocs(q);
      const list: WithdrawalRecord[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          date: data.requestedAt?.toDate
            ? data.requestedAt.toDate().toLocaleDateString("en-IN")
            : "Recently",
          amount: data.amount || 0,
          status: data.status || "Pending",
        });
      });

      setHistory(list);
    } catch (err) {
      console.error("Error loading wallet details:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const withdrawalAmount = Number(amount);

    if (!withdrawalAmount || withdrawalAmount < minimumWithdrawal) {
      setMessage({
        text: `Minimum withdrawal amount is ₹${minimumWithdrawal}.`,
        type: "error",
      });
      return;
    }

    if (withdrawalAmount > walletBalance) {
      setMessage({
        text: "Insufficient wallet balance.",
        type: "error",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Save pending request to database
      await addDoc(collection(db, "withdrawals"), {
        userId: activeUserId,
        amount: withdrawalAmount,
        status: "Pending",
        requestedAt: serverTimestamp(),
      });

      setMessage({
        text: "Withdrawal request submitted successfully. Awaiting admin review.",
        type: "success",
      });
      setAmount("");
      await fetchWithdrawalData(); // Refresh history
    } catch (err: any) {
      setMessage({
        text: err.message || "Failed to submit withdrawal request.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white">
        <p className="text-xl font-semibold">Loading Wallet & Payout Details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Withdraw Money</h1>
        <p className="text-gray-400 mt-1">
          Submit and track your withdrawal requests
        </p>
      </div>

      {/* Wallet Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <p className="text-sm text-gray-500">Available Wallet Balance</p>
          <p className="text-3xl font-bold text-green-600 mt-2">₹{walletBalance}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <p className="text-sm text-gray-500">Minimum Withdrawal</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">₹{minimumWithdrawal}</p>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Request Withdrawal
        </h2>

        {message && (
          <div
            className={`p-4 rounded-xl mb-6 font-semibold ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block font-semibold text-gray-800 mb-2">
            Withdrawal Amount
          </label>

          <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:border-[#D4AF37]">
            <span className="px-4 py-3 bg-gray-100 font-bold text-gray-700">
              ₹
            </span>
            <input
              type="number"
              min="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 outline-none"
              required
            />
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Minimum withdrawal amount is ₹100. Payouts are reviewed by admin.
          </p>

          <button
            type="submit"
            disabled={submitting || walletBalance < 100}
            className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-[#FFD21C] to-[#C99420] text-black font-bold hover:scale-[1.01] transition disabled:opacity-40"
          >
            {submitting ? "SUBMITTING..." : "REQUEST WITHDRAWAL"}
          </button>
        </form>
      </div>

      {/* Withdrawal History */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Withdrawal History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-black text-white">
                <th className="px-5 py-4 text-left">Date</th>
                <th className="px-5 py-4 text-left">Amount</th>
                <th className="px-5 py-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {history.length > 0 ? (
                history.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-700">{item.date}</td>
                    <td className="px-5 py-4 font-bold text-gray-900">₹{item.amount}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          item.status === "Paid" || item.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : item.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-gray-500">
                    No withdrawal requests found.
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

export default Withdraw;