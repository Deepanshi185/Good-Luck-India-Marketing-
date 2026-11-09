import { useState, useEffect } from "react";
import { Search, Check, Clock } from "lucide-react";
import { db } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  increment,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

type InstallmentStatus = {
  paid: boolean;
  paidAt: string | null;
};

type Member = {
  id: string;
  name: string;
  mobile: string;
  group: string;
  uplineChain: string[];
  installments: {
    1: InstallmentStatus;
    2: InstallmentStatus;
  };
};

const LEVEL_INCOME_RATES: Record<number, number> = {
  1: 200, // Level 1 (First Installment)
  2: 100, // Level 2 (Second Installment)
  3: 50,  // Level 3
  4: 50,  // Level 4
  5: 50,  // Level 5
  6: 50,  // Level 6
};

function Payments() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<Member[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "users"));
      const list: Member[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: data.userId || docSnap.id,
          name: data.fullName || "Member",
          mobile: data.mobile || "N/A",
          group: data.group || "Group A",
          uplineChain: data.uplineChain || [],
          installments: data.installments || {
            1: { paid: false, paidAt: null },
            2: { paid: false, paidAt: null },
          },
        });
      });

      setUsers(list);
      if (list.length > 0 && !selectedUser) {
        setSelectedUser(list[0].id);
      }
    } catch (err) {
      console.error("Error fetching users for payment management:", err);
    } finally {
      setLoading(false);
    }
  }

  const currentUser = users.find((user) => user.id === selectedUser);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.id.toLowerCase().includes(search.toLowerCase()) ||
      user.mobile.includes(search)
  );

  const handleClearInstallment = async (
    member: Member,
    installmentNum: 1 | 2
  ) => {
    setProcessingId(`${member.id}-${installmentNum}`);

    try {
      const userRef = doc(db, "users", member.id);

      // 1. Mark target installment as paid in Firestore
      await updateDoc(userRef, {
        [`installments.${installmentNum}.paid`]: true,
        [`installments.${installmentNum}.paidAt`]: new Date().toISOString(),
      });

      const uplineChain = member.uplineChain || [];

      // 2. Distribute Level Incomes to Upline Parents based on rules
      for (let level = 1; level <= Math.min(6, uplineChain.length); level++) {
        const parentId = uplineChain[level - 1];
        if (!parentId) continue;

        let incomeAmount = 0;
        let incomeType = "";

        if (installmentNum === 1 && level === 1) {
          incomeAmount = LEVEL_INCOME_RATES[1]; // ₹200 for L1 on 1st Installment
          incomeType = "Renewal Income";
        } else if (installmentNum === 2 && level >= 2 && level <= 6) {
          incomeAmount = LEVEL_INCOME_RATES[level]; // ₹100/₹50 for L2-L6 on 2nd Installment
          incomeType = "Level Income";
        }

        if (incomeAmount > 0) {
          const parentRef = doc(db, "users", parentId);
          const parentSnap = await getDoc(parentRef);

          if (parentSnap.exists()) {
            await updateDoc(parentRef, {
              "wallet.currentBalance": increment(incomeAmount),
              "wallet.totalIncome": increment(incomeAmount),
              ...(incomeType === "Renewal Income"
                ? { "wallet.renewalIncome": increment(incomeAmount) }
                : { "wallet.levelIncome": increment(incomeAmount) }),
            });

            // Log detailed transaction ledger
            await addDoc(collection(db, "transactions"), {
              userId: parentId,
              fromMemberId: member.id,
              fromMemberName: member.name,
              level: level,
              amount: incomeAmount,
              type: incomeType,
              installmentNumber: installmentNum,
              createdAt: serverTimestamp(),
            });
          }
        }
      }

      await fetchUsers(); // Refresh data list
    } catch (err) {
      console.error("Error updating payment status:", err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white">
        <p className="text-sm sm:text-base font-semibold">Loading Member Data...</p>
      </div>
    );
  }

  const inst1Paid = currentUser?.installments[1]?.paid || false;
  const inst2Paid = currentUser?.installments[2]?.paid || false;
  const paidCount = (inst1Paid ? 1 : 0) + (inst2Paid ? 1 : 0);
  const pendingCount = 2 - paidCount;

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Payment Management
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Clear member installments to trigger automatic 6-level income distributions
        </p>
      </div>

      {/* User Search & Selection Card */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
        <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-4">
          Select Member
        </h2>

        <div className="relative w-full sm:max-w-md">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search member by ID or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Members List */}
        <div className="mt-4 space-y-2 max-h-56 sm:max-h-60 overflow-y-auto pr-1">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user.id)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition ${
                  selectedUser === user.id
                    ? "border-[#D4AF37] bg-yellow-50/80 shadow-sm"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900 text-xs sm:text-sm">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ID: {user.id} • Mobile: {user.mobile}
                    </p>
                  </div>
                  {selectedUser === user.id && (
                    <Check size={18} className="text-[#B8860B]" />
                  )}
                </div>
              </button>
            ))
          ) : (
            <p className="text-gray-500 py-4 text-center text-xs sm:text-sm">
              No matching members found.
            </p>
          )}
        </div>
      </div>

      {/* Selected User Section */}
      {currentUser && (
        <>
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">Selected Member</p>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">
                  {currentUser.name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  Member ID: <span className="font-semibold text-gray-800">{currentUser.id}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 sm:flex gap-3">
                <StatusSummary label="Paid" value={paidCount} />
                <StatusSummary label="Pending" value={pendingCount} />
              </div>
            </div>
          </div>

          {/* Payment Table / Cards */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-base sm:text-xl font-bold text-gray-900">
                Payment Clearance
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Updating an installment automatically processes upline team incomes.
              </p>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black text-white text-xs sm:text-sm">
                    <th className="px-5 py-4">Installment</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Triggered Income Rule</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
                  {/* 1st Installment Row */}
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4 font-bold text-gray-900">1st Installment</td>
                    <td className="px-5 py-4 text-gray-600">
                      {currentUser.installments[1]?.paidAt
                        ? new Date(currentUser.installments[1].paidAt!).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-green-700">
                      Level 1 Income (₹200)
                    </td>
                    <td className="px-5 py-4">
                      {inst1Paid ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          <Check size={14} /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                          <Clock size={14} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {!inst1Paid && (
                        <button
                          disabled={processingId === `${currentUser.id}-1`}
                          onClick={() => handleClearInstallment(currentUser, 1)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFD21C] to-[#C99420] text-black font-bold hover:scale-[1.02] transition disabled:opacity-50 text-xs shadow-sm"
                        >
                          {processingId === `${currentUser.id}-1` ? "Processing..." : "Mark 1st Paid"}
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* 2nd Installment Row */}
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4 font-bold text-gray-900">2nd Installment</td>
                    <td className="px-5 py-4 text-gray-600">
                      {currentUser.installments[2]?.paidAt
                        ? new Date(currentUser.installments[2].paidAt!).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-blue-700">
                      Level 2–6 Team Incomes (L2: ₹100, L3-L6: ₹50)
                    </td>
                    <td className="px-5 py-4">
                      {inst2Paid ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          <Check size={14} /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                          <Clock size={14} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {!inst2Paid && (
                        <button
                          disabled={!inst1Paid || processingId === `${currentUser.id}-2`}
                          onClick={() => handleClearInstallment(currentUser, 2)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:scale-[1.02] transition disabled:opacity-40 text-xs shadow-sm"
                        >
                          {processingId === `${currentUser.id}-2` ? "Processing..." : "Mark 2nd Paid"}
                        </button>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile View Cards */}
            <div className="block md:hidden divide-y divide-gray-200 p-3 space-y-4">
              
              {/* Mobile Card - Installment 1 */}
              <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-sm">1st Installment</span>
                  {inst1Paid ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[11px] font-semibold">
                      <Check size={12} /> Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[11px] font-semibold">
                      <Clock size={12} /> Pending
                    </span>
                  )}
                </div>

                <p className="text-xs text-green-700 font-medium">
                  Trigger: Level 1 Income (₹200)
                </p>
                <p className="text-[11px] text-gray-500">
                  Date: {currentUser.installments[1]?.paidAt ? new Date(currentUser.installments[1].paidAt!).toLocaleDateString("en-IN") : "—"}
                </p>

                {!inst1Paid && (
                  <button
                    disabled={processingId === `${currentUser.id}-1`}
                    onClick={() => handleClearInstallment(currentUser, 1)}
                    className="w-full mt-1 py-2 rounded-xl bg-gradient-to-r from-[#FFD21C] to-[#C99420] text-black font-bold text-xs shadow-sm"
                  >
                    {processingId === `${currentUser.id}-1` ? "Processing..." : "Mark 1st Paid"}
                  </button>
                )}
              </div>

              {/* Mobile Card - Installment 2 */}
              <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 space-y-2.5 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-sm">2nd Installment</span>
                  {inst2Paid ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[11px] font-semibold">
                      <Check size={12} /> Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[11px] font-semibold">
                      <Clock size={12} /> Pending
                    </span>
                  )}
                </div>

                <p className="text-xs text-blue-700 font-medium">
                  Trigger: Level 2–6 Team Incomes
                </p>
                <p className="text-[11px] text-gray-500">
                  Date: {currentUser.installments[2]?.paidAt ? new Date(currentUser.installments[2].paidAt!).toLocaleDateString("en-IN") : "—"}
                </p>

                {!inst2Paid && (
                  <button
                    disabled={!inst1Paid || processingId === `${currentUser.id}-2`}
                    onClick={() => handleClearInstallment(currentUser, 2)}
                    className="w-full mt-1 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-sm disabled:opacity-40"
                  >
                    {processingId === `${currentUser.id}-2` ? "Processing..." : "Mark 2nd Paid"}
                  </button>
                )}
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatusSummary({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-gray-200 rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 text-center flex-1 sm:min-w-[100px] bg-gray-50/50">
      <p className="text-[11px] sm:text-xs text-gray-500">{label}</p>
      <p className="text-lg sm:text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default Payments;