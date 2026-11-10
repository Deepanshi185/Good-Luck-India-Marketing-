import { useState, useEffect } from "react";
import { Search, CheckCircle2, Clock3 } from "lucide-react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

type MemberMonthlyRecord = {
  id: string;
  name: string;
  mobile: string;
  email: string;
  monthlyPayments: Record<number, { paid: boolean; paidAt?: string }>;
};

function MonthlyPayments() {
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState<MemberMonthlyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberMonthlyRecord | null>(null);
  const [updatingMonth, setUpdatingMonth] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchMembersMonthlyData();
  }, []);

  async function fetchMembersMonthlyData() {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "users"));
      const list: MemberMonthlyRecord[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.role !== "admin") {
          const defaultMonths: Record<number, { paid: boolean; paidAt?: string }> = {};
          for (let m = 1; m <= 21; m++) {
            defaultMonths[m] = data.monthlyPayments?.[m] || { paid: false, paidAt: undefined };
          }

          list.push({
            id: data.userId || docSnap.id,
            name: data.fullName || "N/A",
            mobile: data.mobile || "N/A",
            email: data.email || "N/A",
            monthlyPayments: defaultMonths,
          });
        }
      });

      setMembers(list);
      if (list.length > 0 && !selectedMember) {
        setSelectedMember(list[0]);
      }
    } catch (err) {
      console.error("Error fetching monthly payment records:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleMonth = async (monthNum: number) => {
    if (!selectedMember) return;
    setUpdatingMonth(monthNum);

    try {
      const currentStatus = selectedMember.monthlyPayments[monthNum]?.paid || false;
      const newStatus = !currentStatus;
      const currentDate = newStatus ? new Date().toISOString().split("T")[0] : undefined;

      const userRef = doc(db, "users", selectedMember.id);
      
      await updateDoc(userRef, {
        [`monthlyPayments.${monthNum}`]: {
          paid: newStatus,
          paidAt: currentDate,
        },
      });

      const updatedMonthly = {
        ...selectedMember.monthlyPayments,
        [monthNum]: { paid: newStatus, paidAt: currentDate },
      };

      const updatedMember = {
        ...selectedMember,
        monthlyPayments: updatedMonthly,
      };

      setSelectedMember(updatedMember);
      setMembers((prev) =>
        prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
      );

      setToast(
        `Month ${monthNum} (₹1,000) for ${selectedMember.name} marked as ${
          newStatus ? "PAID" : "PENDING"
        }`
      );
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      console.error("Failed to update monthly payment:", err);
      alert("Failed to update monthly payment status.");
    } finally {
      setUpdatingMonth(null);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase()) ||
      m.mobile.includes(search)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px] text-white">
        <p className="text-sm font-semibold">Loading 21-Month Installment Records...</p>
      </div>
    );
  }

  const paidMonthsCount = selectedMember
    ? Object.values(selectedMember.monthlyPayments).filter((m) => m.paid).length
    : 0;
  const totalPaidAmount = paidMonthsCount * 1000;

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6">
      
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-semibold animate-bounce">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          21-Month Installments Tracker (₹1,000/mo)
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Admin control to record and manage members' monthly recurring company payments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-5 border border-gray-100 flex flex-col h-[600px]">
          <h2 className="text-base font-bold text-gray-900 mb-3">Select Member</h2>
          
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search ID, Name, Mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((m) => {
                const paidCount = Object.values(m.monthlyPayments).filter((x) => x.paid).length;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMember(m)}
                    className={`w-full text-left p-3 rounded-xl border transition ${
                      selectedMember?.id === m.id
                        ? "border-[#D4AF37] bg-yellow-50/80 shadow-sm"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-900 text-xs sm:text-sm">{m.name}</p>
                        <p className="text-[11px] text-gray-500">{m.id} • {m.mobile}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {paidCount}/21 Paid
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-center text-xs text-gray-500 py-10">No members found.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100 flex flex-col">
          {selectedMember ? (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {selectedMember.name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    ID: <span className="font-semibold text-gray-800">{selectedMember.id}</span> • Mobile: {selectedMember.mobile}
                  </p>
                </div>

                <div className="flex gap-2">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-center">
                    <p className="text-[10px] text-gray-500 font-medium">Months Paid</p>
                    <p className="text-sm font-bold text-gray-900">{paidMonthsCount} / 21</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-center">
                    <p className="text-[10px] text-green-600 font-medium">Total Collected</p>
                    <p className="text-sm font-bold text-green-700">₹{totalPaidAmount.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#D4AF37] uppercase tracking-wide mb-3">
                  Click a month to toggle payment status (₹1,000 each)
                </h3>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                  {Array.from({ length: 21 }, (_, i) => i + 1).map((monthNum) => {
                    const monthData = selectedMember.monthlyPayments[monthNum] || { paid: false };
                    const isUpdating = updatingMonth === monthNum;

                    return (
                      <button
                        key={monthNum}
                        disabled={isUpdating}
                        onClick={() => handleToggleMonth(monthNum)}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                          monthData.paid
                            ? "bg-green-100 border-green-400 text-green-900 shadow-sm hover:bg-green-200"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                        } disabled:opacity-50`}
                      >
                        <span className="text-[10px] text-gray-500 font-semibold uppercase">
                          Month {monthNum}
                        </span>
                        <span className="text-xs font-bold text-gray-900 my-0.5">
                          ₹1,000
                        </span>
                        {monthData.paid ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-green-700 bg-green-200/70 px-1.5 py-0.5 rounded-full mt-0.5">
                            <CheckCircle2 size={10} /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full mt-0.5">
                            <Clock3 size={10} /> Pending
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm py-20">
              Select a member from the left list to view their 21-month payment tracker.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default MonthlyPayments;