import { useEffect, useState } from "react";
import { db } from "../firebaseConfig"; // Adjust relative path if needed
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

type MyPaymentRecord = {
  userId: string;
  monthsPaid: number;
  totalAmount: string;
  paidDate: string;
  status: "Paid" | "Pending";
};

type DirectPaymentRecord = {
  userId: string;
  name: string;
  month: number;
  group: string;
  paidDate: string;
  amount: string;
  status: "Paid" | "Pending";
};

function PaymentStatus() {
  const activeUserId = localStorage.getItem("activeUserId") || "dnoenw1";

  const [myPayments, setMyPayments] = useState<MyPaymentRecord[]>([]);
  const [directPayments, setDirectPayments] = useState<DirectPaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPaymentDetails() {
      try {
        setLoading(true);

        // 1. Fetch current logged-in user doc
        const userSnap = await getDoc(doc(db, "users", activeUserId));

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const inst = userData.installments || {};

          let paidCount = 0;
          let lastPaidDate = "—";

          if (inst[1]?.paid) {
            paidCount++;
            if (inst[1].paidAt) lastPaidDate = new Date(inst[1].paidAt).toLocaleDateString("en-IN");
          }
          if (inst[2]?.paid) {
            paidCount++;
            if (inst[2].paidAt) lastPaidDate = new Date(inst[2].paidAt).toLocaleDateString("en-IN");
          }

          setMyPayments([
            {
              userId: userData.userId || activeUserId,
              monthsPaid: paidCount,
              totalAmount: `₹${paidCount * 500}`,
              paidDate: lastPaidDate,
              status: paidCount > 0 ? "Paid" : "Pending",
            },
          ]);
        }

        // 2. Fetch direct downline members (where referrerId == activeUserId)
        const q = query(
          collection(db, "users"),
          where("referrerId", "==", activeUserId)
        );
        const qSnap = await getDocs(q);
        const directList: DirectPaymentRecord[] = [];

        qSnap.forEach((docSnap) => {
          const d = docSnap.data();
          const inst = d.installments || {};

          let paidCount = 0;
          let lastDate = "—";

          if (inst[1]?.paid) {
            paidCount++;
            if (inst[1].paidAt) lastDate = new Date(inst[1].paidAt).toLocaleDateString("en-IN");
          }
          if (inst[2]?.paid) {
            paidCount++;
            if (inst[2].paidAt) lastDate = new Date(inst[2].paidAt).toLocaleDateString("en-IN");
          }

          directList.push({
            userId: d.userId || docSnap.id,
            name: d.fullName || "Member",
            month: paidCount,
            group: d.group || "Group A",
            paidDate: lastDate,
            amount: `₹${paidCount * 500}`,
            status: paidCount > 0 ? "Paid" : "Pending",
          });
        });

        setDirectPayments(directList);
      } catch (err) {
        console.error("Error fetching payment status details:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPaymentDetails();
  }, [activeUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white">
        <p className="text-xl font-semibold">Loading Payment Status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white">Payment Status</h1>
        <p className="text-gray-400 mt-1">
          View your payment and installment status
        </p>
      </div>

      {/* MY PAYMENT STATUS */}
      <section className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          My Payment Status
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="border border-gray-700 px-4 py-4 text-left">
                  User ID
                </th>
                <th className="border border-gray-700 px-4 py-4 text-left">
                  Months Paid
                </th>
                <th className="border border-gray-700 px-4 py-4 text-left">
                  Total Amount
                </th>
                <th className="border border-gray-700 px-4 py-4 text-left">
                  Last Paid Date
                </th>
                <th className="border border-gray-700 px-4 py-4 text-left">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {myPayments.length > 0 ? (
                myPayments.map((payment, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-5 font-bold">
                      {payment.userId}
                    </td>
                    <td className="border border-gray-200 px-4 py-5 font-semibold">
                      {payment.monthsPaid} / 21
                    </td>
                    <td className="border border-gray-200 px-4 py-5 font-semibold text-green-700">
                      {payment.totalAmount}
                    </td>
                    <td className="border border-gray-200 px-4 py-5 text-gray-600">
                      {payment.paidDate}
                    </td>
                    <td className="border border-gray-200 px-4 py-5">
                      <StatusBadge status={payment.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="border border-gray-200 px-4 py-8 text-center text-gray-500"
                  >
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* DIRECT DOWNLINE PAYMENT STATUS */}
      <section className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Direct Downline Payment Status
        </h2>
        <p className="text-gray-500 mb-6">
          View payment status of your directly referred members.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="border border-gray-700 px-4 py-4 text-left">#</th>
                <th className="border border-gray-700 px-4 py-4 text-left">User ID</th>
                <th className="border border-gray-700 px-4 py-4 text-left">Name</th>
                <th className="border border-gray-700 px-4 py-4 text-left">Months Paid</th>
                <th className="border border-gray-700 px-4 py-4 text-left">Group</th>
                <th className="border border-gray-700 px-4 py-4 text-left">Last Paid Date</th>
                <th className="border border-gray-700 px-4 py-4 text-left">Amount</th>
                <th className="border border-gray-700 px-4 py-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {directPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="border border-gray-200 px-4 py-10 text-center text-gray-500"
                  >
                    No Direct Downline members found.
                  </td>
                </tr>
              ) : (
                directPayments.map((payment, index) => (
                  <tr key={payment.userId} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-5 text-gray-500">
                      {index + 1}
                    </td>
                    <td className="border border-gray-200 px-4 py-5 font-semibold text-gray-900">
                      {payment.userId}
                    </td>
                    <td className="border border-gray-200 px-4 py-5 text-gray-800">
                      {payment.name}
                    </td>
                    <td className="border border-gray-200 px-4 py-5 font-semibold text-gray-900">
                      {payment.month}
                    </td>
                    <td className="border border-gray-200 px-4 py-5 text-gray-600">
                      {payment.group}
                    </td>
                    <td className="border border-gray-200 px-4 py-5 text-gray-600">
                      {payment.paidDate}
                    </td>
                    <td className="border border-gray-200 px-4 py-5 font-semibold text-green-700">
                      {payment.amount}
                    </td>
                    <td className="border border-gray-200 px-4 py-5">
                      <StatusBadge status={payment.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* PAYMENT INFORMATION */}
      <section className="bg-yellow-50 border border-yellow-300 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-yellow-900">Payment Information</h2>
        <p className="text-sm text-yellow-800 mt-2">
          Payment status is updated manually by company administration. Members can view their status but cannot modify it directly.
        </p>
      </section>
    </div>
  );
}

/* ---------------- STATUS BADGE ---------------- */

function StatusBadge({ status }: { status: "Paid" | "Pending" }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
        status === "Paid"
          ? "bg-green-100 text-green-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {status}
    </span>
  );
}

export default PaymentStatus;