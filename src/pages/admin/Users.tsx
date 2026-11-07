import { useState, useEffect } from "react";
import { Search, Eye, Edit, X, Check } from "lucide-react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

type Member = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  level: string;
  status: string;
  pan: string;
  referrerId?: string;
};

function Users() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [viewingUser, setViewingUser] = useState<Member | null>(null);
  const [editingUser, setEditingUser] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    mobile: "",
    pan: "",
    referrerId: "",
  });
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchLiveUsers();
  }, []);

  async function fetchLiveUsers() {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "users"));
      const list: Member[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const chainLength = (data.uplineChain || []).length;
        const calculatedLevel =
          chainLength > 0 ? `Level ${chainLength}` : "Direct / Top";

        list.push({
          id: data.userId || docSnap.id,
          name: data.fullName || "N/A",
          email: data.email || "N/A",
          mobile: data.mobile || "N/A",
          level: calculatedLevel,
          status: data.role === "admin" ? "Admin" : "Active",
          pan: data.pan || "N/A",
          referrerId: data.referrerId || "",
        });
      });

      setUsers(list);
    } catch (err) {
      console.error("Error fetching live users from Firestore:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenEdit = (user: Member) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      pan: user.pan === "N/A" ? "" : user.pan,
      referrerId: user.referrerId || "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);

    try {
      const userRef = doc(db, "users", editingUser.id);
      await updateDoc(userRef, {
        fullName: editForm.name,
        email: editForm.email,
        mobile: editForm.mobile,
        pan: editForm.pan.trim() || "N/A",
        referrerId: editForm.referrerId.trim() || null,
      });

      // Update state locally
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: editForm.name,
                email: editForm.email,
                mobile: editForm.mobile,
                pan: editForm.pan.trim() || "N/A",
                referrerId: editForm.referrerId.trim(),
              }
            : u
        )
      );

      setEditingUser(null);
      setToastMessage(`Member ${editingUser.id} updated successfully!`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user details.");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.id.toLowerCase().includes(search.toLowerCase()) ||
      user.mobile.includes(search)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-white">
        <p className="text-sm sm:text-base font-semibold">Loading Registered Users...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-semibold animate-bounce">
          <Check size={18} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Users</h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          View and manage registered members
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
        <StatCard title="Total Users" value={users.length.toString()} />
        <StatCard
          title="Active Members"
          value={users.filter((u) => u.status === "Active").length.toString()}
        />
        <StatCard
          title="Admin Accounts"
          value={users.filter((u) => u.status === "Admin").length.toString()}
        />
      </div>

      {/* User Table & Card Container */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Search Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Registered Users
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Manage member information
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by ID, name, or mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black text-white text-xs sm:text-sm">
                <th className="px-5 py-4">ID No.</th>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Mobile</th>
                <th className="px-5 py-4">Level</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4 font-bold text-gray-900">
                      {user.id}
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{user.mobile}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        {user.level}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.status === "Admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setViewingUser(user)}
                          title="View Details"
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(user)}
                          title="Edit User"
                          className="p-2 rounded-lg border border-gray-200 hover:bg-yellow-50 hover:border-yellow-400 text-gray-600 transition"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                    No members found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="block md:hidden divide-y divide-gray-200 p-3">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div key={user.id} className="py-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-900 text-sm">
                      {user.id}
                    </span>
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {user.name}
                    </h3>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      user.status === "Admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>

                <div className="text-xs text-gray-600 flex justify-between items-center">
                  <span>Mobile: {user.mobile}</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full font-medium">
                    {user.level}
                  </span>
                </div>

                <div className="text-xs text-gray-400 truncate">
                  {user.email}
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setViewingUser(user)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() => handleOpenEdit(user)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#D4AF37] text-black text-xs font-semibold hover:bg-[#b8972e]"
                  >
                    <Edit size={14} /> Edit
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-xs text-gray-500">
              No members found in database.
            </p>
          )}
        </div>
      </div>

      {/* VIEW USER MODAL */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative">
            <button
              onClick={() => setViewingUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Member Details
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              User ID: <span className="font-bold text-gray-800">{viewingUser.id}</span>
            </p>

            <div className="space-y-3 text-xs sm:text-sm">
              <DetailRow label="Full Name" value={viewingUser.name} />
              <DetailRow label="Email Address" value={viewingUser.email} />
              <DetailRow label="Mobile Number" value={viewingUser.mobile} />
              <DetailRow label="PAN Details" value={viewingUser.pan} />
              <DetailRow label="Referral ID" value={viewingUser.referrerId || "None (Top Level)"} />
              <DetailRow label="Current Level" value={viewingUser.level} />
              <DetailRow label="Account Status" value={viewingUser.status} />
            </div>

            <button
              onClick={() => setViewingUser(null)}
              className="mt-6 w-full py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-xs sm:text-sm hover:bg-gray-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Edit Member Details
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Editing User: <span className="font-bold text-gray-800">{editingUser.id}</span>
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  PAN Details (Optional)
                </label>
                <input
                  type="text"
                  value={editForm.pan}
                  onChange={(e) => setEditForm({ ...editForm, pan: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Referral ID
                </label>
                <input
                  type="text"
                  value={editForm.referrerId}
                  onChange={(e) => setEditForm({ ...editForm, referrerId: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#D4AF37]"
                  placeholder="Referrer ID"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD21C] to-[#F59E0B] text-black font-bold hover:scale-[1.01] transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xl border border-gray-100">
      <p className="text-xs text-gray-500 font-medium">{title}</p>
      <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

export default Users;