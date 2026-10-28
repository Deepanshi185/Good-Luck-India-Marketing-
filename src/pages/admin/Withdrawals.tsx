import { useState, useEffect } from "react";
import { db } from "../../firebaseConfig"; // Adjust relative path if needed
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

type Withdrawal = {
  id: string;
  date: string;
  amount: number;
  status: "Pending" | "Paid" | "Rejected";
};

function Withdraw() {
  const activeUserId = localStorage.getItem("activeUserId") || "dnoenw1";

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const minimumWithdrawal = 100;

  useEffect(() => {
    fetchUserDataAndHistory();
  }, [activeUserId]);

  async function fetchUserDataAndHistory() {
    try {
      setLoading(true);

      // 1. Fetch live available balance from user document
      const userSnap = await getDoc(doc(db, "users", activeUserId));
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setWalletBalance(userData.wallet?.currentBalance || 0);
      }

      // 2. Fetch withdrawal history for the active user
      const q = query(
        collection(db, "withdrawals"),
        where("userId", "==", activeUserId)
      );
      const querySnapshot = await getDocs(q);
      const list: Withdrawal[] = [];

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

      setWithdrawals(list);
    } catch (err) {
      console.error("Error fetching withdrawal details:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const withdrawalAmount = Number(amount);

    if (!amount || withdrawalAmount <= 0) {
      setMessage({ text: "Please enter a valid withdrawal amount.", type: "error" });
      return;
    }

    if (withdrawalAmount < minimumWithdrawal) {
      setMessage({
        text: `Minimum withdrawal amount is ₹${minimumWithdrawal}.`,
        type: "error",
      });
      return;
    }

    if (withdrawalAmount > walletBalance) {
      setMessage({
        text: "Withdrawal amount cannot exceed your wallet balance.",
        type: "error",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Record new withdrawal request in Firestore
      await addDoc(collection(db, "withdrawals"), {
        userId: activeUserId,
        amount: withdrawalAmount,
        status: "Pending",
        requestedAt: serverTimestamp(),
      });

      setMessage({
        text: "Withdrawal request submitted successfully. It is now pending admin approval.",
        type: "success",
      });
      setAmount("");
      await fetchUserDataAndHistory(); // Refresh history table & status
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
        <p className="text-xl font-semibold">Loading Wallet & Withdrawal History...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Withdraw Money</h1>
        <p className="text-gray-400 mt-1">Request a withdrawal from your wallet</p>
      </div>

      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-gradient-to-r from-[#FFD21C] to-[#C99420] rounded-2xl p-6 shadow-xl">
          <p className="text-sm font-semibold text-black/70">Available Wallet Balance</p>
          <p className="text-4xl font-bold text-black mt-2">₹{walletBalance}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <p className="text-sm text-gray-500">Minimum Withdrawal</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">₹{minimumWithdrawal}</p>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold text-gray-900">Request Withdrawal</h2>
        <p className="text-sm text-gray-500 mt-1">Enter the amount you want to withdraw.</p>

        <form onSubmit={handleSubmit} className="mt-6 max-w-xl">
          <label className="block font-semibold text-gray-800 mb-2">Withdrawal Amount</label>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
              ₹
            </span>
            <input
              type="number"
              min={minimumWithdrawal}
              max={walletBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Minimum ₹${minimumWithdrawal}`}
              className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#D4AF37]"
              required
            />
          </div>

          <p className="text-sm text-gray-500 mt-2">Available balance: ₹{walletBalance}</p>

          {/* Feedback Message */}
          {message && (
            <div
              className={`mt-4 p-4 rounded-xl text-sm font-semibold ${
                message.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-red-100 text-red-800 border border-red-300"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || walletBalance < minimumWithdrawal}
            className="mt-6 w-full md:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#FFD21C] to-[#C99420] text-black font-bold hover:scale-[1.02] transition disabled:opacity-40"
          >
            {submitting ? "Submitting..." : "Submit Withdrawal Request"}
          </button>
        </form>
      </div>

      {/* Important Information */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Withdrawal Process</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ProcessStep
            number="1"
            title="Submit Request"
            description="Enter an amount of at least ₹100 and submit your request."
          />
          <ProcessStep
            number="2"
            title="Admin Review"
            description="Your withdrawal request will be reviewed by the admin."
          />
          <ProcessStep
            number="3"
            title="Payment"
            description="Admin will manually process the payment and mark it as Paid."
          />
        </div>
      </div>

      {/* Withdrawal History */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Withdrawal History</h2>
          <p className="text-sm text-gray-500 mt-1">Track your previous withdrawal requests</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-black text-white">
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>

            <tbody>
              {withdrawals.length > 0 ? (
                withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-600">{withdrawal.date}</td>
                    <td className="px-6 py-4 text-right font-semibold">₹{withdrawal.amount}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          withdrawal.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : withdrawal.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {withdrawal.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    No withdrawal requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-5">
        <p className="font-semibold text-yellow-800">Important</p>
        <p className="text-sm text-yellow-700 mt-1">
          Withdrawal requests are processed manually by the admin. Members cannot change the payment status themselves.
        </p>
      </div>
    </div>
  );
}

function ProcessStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <div className="w-9 h-9 rounded-full bg-[#FFD21C] flex items-center justify-center font-bold text-black">
        {number}
      </div>
      <h3 className="font-bold text-gray-900 mt-4">{title}</h3>
      <p className="text-sm text-gray-500 mt-2">{description}</p>
    </div>
  );
}

export default Withdraw;