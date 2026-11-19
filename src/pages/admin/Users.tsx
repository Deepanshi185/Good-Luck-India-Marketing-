import { useState, useEffect } from "react";
import { Search, Eye, EyeOff, Edit, X, Check, Lock } from "lucide-react";
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
  password?: string;
};

function Users() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [viewingUser, setViewingUser] = useState<Member | null>(null);
  const [showViewPassword, setShowViewPassword] = useState(false);

  const [editingUser, setEditingUser] = useState<Member | null>(null);
  const [showEditCurrentPassword, setShowEditCurrentPassword] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    mobile: "",
    pan: "",
    referrerId: "",
    password: "",
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
          password: data.password || "Not Set",
        });
      });

      setUsers(list);
    } catch (err) {
      console.error("Error fetching live users from Firestore:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenView = (user: Member) => {
    setShowViewPassword(false);
    setViewingUser(user);
  };

  const handleOpenEdit = (user: Member) => {
    setShowEditCurrentPassword(true);
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      pan: user.pan === "N/A" ? "" : user.pan,
      referrerId: user.referrerId || "",
      password: "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);

    try {
      const userRef = doc(db, "users", editingUser.id);
      const updatePayload: Record<string, any> = {
        fullName: editForm.name,
        email: editForm.email,
        mobile: editForm.mobile,
        pan: editForm.pan.trim() || "N/A",
        referrerId: editForm.referrerId.trim() || null,
      };

      if (editForm.password.trim() !== "") {
        updatePayload.password = editForm.password.trim();
      }

      await updateDoc(userRef, updatePayload);

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
                password:
                  editForm.password.trim() !== ""
                    ? editForm.password.trim()
                    : u.password,
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
      <div className="flex items-center justify-center min-h-[300px] text-gray-700">
        <p className="text-sm sm:text-base font-semibold">
          Loading Registered Users...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-5 sm:space-y-6 pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs sm:text-sm font-semibold">
          <Check size={18} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Users
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
          View and manage registered members
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
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
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        {/* Search Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Registered Users
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Manage member information and credentials
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
                className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm outline-none focus:border-[#D4AF37] bg-gray-50 focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-gray-700 text-xs uppercase tracking-wider font-bold">
                <th className="px-5 py-3.5">ID No.</th>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Mobile</th>
                <th className="px-5 py-3.5">Level</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-amber-50/40 transition">
                    <td className="px-5 py-4 font-bold text-gray-900">
                      {user.id}
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-medium">
                      {user.mobile}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        {user.level}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.status === "Admin"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenView(user)}
                          title="View Details"
                          className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 transition cursor-pointer"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(user)}
                          title="Edit User & Password"
                          className="p-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 transition cursor-pointer"
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
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>

                <div className="text-xs text-gray-600 flex justify-between items-center">
                  <span>Mobile: {user.mobile}</span>
                  <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-medium">
                    {user.level}
                  </span>
                </div>

                <div className="text-xs text-gray-500 truncate">{user.email}</div>

                {/* Mobile Action Buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleOpenView(user)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() => handleOpenEdit(user)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-[#FFD21C] to-[#F59E0B] text-gray-950 text-xs font-bold shadow-sm cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-extrabold text-gray-900 mb-0.5">
              Member Details
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              User ID:{" "}
              <span className="font-bold text-gray-900">{viewingUser.id}</span>
            </p>

            <div className="space-y-3 text-xs sm:text-sm">
              <DetailRow label="Full Name" value={viewingUser.name} />
              <DetailRow label="Email Address" value={viewingUser.email} />
              <DetailRow label="Mobile Number" value={viewingUser.mobile} />
              <DetailRow label="PAN Details" value={viewingUser.pan} />
              <DetailRow
                label="Referral ID"
                value={viewingUser.referrerId || "None (Top Level)"}
              />
              <DetailRow label="Current Level" value={viewingUser.level} />
              <DetailRow label="Account Status" value={viewingUser.status} />

              {/* Current Password Row */}
              <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200 rounded-xl px-3.5 py-2.5 mt-2">
                <div>
                  <span className="text-[11px] font-semibold text-amber-800 block">
                    Current Password
                  </span>
                  <span className="font-mono font-bold text-gray-900 text-sm">
                    {showViewPassword
                      ? viewingUser.password || "Not Set"
                      : "••••••••"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowViewPassword(!showViewPassword)}
                  className="p-1.5 rounded-lg bg-white border border-amber-200 text-amber-900 hover:bg-amber-100 transition cursor-pointer"
                  title={showViewPassword ? "Hide Password" : "Show Password"}
                >
                  {showViewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setViewingUser(null)}
              className="mt-6 w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-extrabold text-gray-900 mb-0.5">
              Edit Member Details
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Editing User:{" "}
              <span className="font-bold text-gray-900">{editingUser.id}</span>
            </p>

            <form
              onSubmit={handleSaveEdit}
              className="space-y-3.5 text-xs sm:text-sm"
            >
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#D4AF37] bg-gray-50 focus:bg-white"
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
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#D4AF37] bg-gray-50 focus:bg-white"
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
                  onChange={(e) =>
                    setEditForm({ ...editForm, mobile: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#D4AF37] bg-gray-50 focus:bg-white"
                  required
                />
              </div>

              {/* Password Section: Shows Current Password + Reset Field */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-amber-900 block">
                      Current Saved Password
                    </span>
                    <span className="font-mono font-bold text-gray-900 text-sm">
                      {showEditCurrentPassword
                        ? editingUser.password || "Not Set"
                        : "••••••••"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setShowEditCurrentPassword(!showEditCurrentPassword)
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition cursor-pointer"
                  >
                    {showEditCurrentPassword ? (
                      <>
                        <EyeOff size={14} /> Hide
                      </>
                    ) : (
                      <>
                        <Eye size={14} /> Show
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-2 border-t border-amber-200/70">
                  <label className="block font-semibold text-gray-800 mb-1 flex items-center justify-between">
                    <span>Reset to New Password (Optional)</span>
                    <Lock size={14} className="text-amber-700" />
                  </label>
                  <input
                    type="text"
                    value={editForm.password}
                    onChange={(e) =>
                      setEditForm({ ...editForm, password: e.target.value })
                    }
                    placeholder="Type new password only if changing"
                    className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#D4AF37] bg-white"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Leave blank to keep the current password shown above.
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  PAN Details (Optional)
                </label>
                <input
                  type="text"
                  value={editForm.pan}
                  onChange={(e) =>
                    setEditForm({ ...editForm, pan: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#D4AF37] bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Referral ID
                </label>
                <input
                  type="text"
                  value={editForm.referrerId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, referrerId: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#D4AF37] bg-gray-50 focus:bg-white"
                  placeholder="Referrer ID"
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD21C] to-[#F59E0B] text-gray-950 font-bold shadow-sm hover:brightness-105 transition disabled:opacity-50 cursor-pointer"
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
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border border-gray-200">
      <p className="text-xs text-gray-500 font-medium">{title}</p>
      <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
        {value}
      </p>
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