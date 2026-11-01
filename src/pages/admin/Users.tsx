import { useState, useEffect } from "react";
import { Search, Eye, Edit } from "lucide-react";
import { db } from "../../firebaseConfig"; // Adjust relative path if needed
import { collection, getDocs } from "firebase/firestore";

type Member = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  level: string;
  status: string;
  pan: string;
};

function Users() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

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
        
        // Calculate dynamic level based on length of uplineChain
        const chainLength = (data.uplineChain || []).length;
        const calculatedLevel = chainLength > 0 ? `Level ${chainLength}` : "Direct / Top";

        list.push({
          id: data.userId || docSnap.id,
          name: data.fullName || "N/A",
          email: data.email || "N/A",
          mobile: data.mobile || "N/A",
          level: calculatedLevel,
          status: data.role === "admin" ? "Admin" : "Active",
          pan: data.pan || "N/A",
        });
      });

      setUsers(list);
    } catch (err) {
      console.error("Error fetching live users from Firestore:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.id.toLowerCase().includes(search.toLowerCase()) ||
      user.mobile.includes(search)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-white">
        <p className="text-lg font-semibold">Loading Registered Users...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Users
        </h1>

        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          View and manage registered members
        </p>
      </div>


      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">

        <StatCard
          title="Total Users"
          value={users.length.toString()}
        />

        <StatCard
          title="Active Members"
          value={
            users
              .filter((user) => user.status === "Active")
              .length.toString()
          }
        />

        <StatCard
          title="Admin Accounts"
          value={
            users
              .filter((user) => user.status === "Admin")
              .length.toString()
          }
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

                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition"
                  >

                    <td className="px-5 py-4 font-bold text-gray-900">
                      {user.id}
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {user.mobile}
                    </td>

                    <td className="px-5 py-4">

                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        {user.level}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.status === "Admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {user.status}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <div className="flex justify-center gap-2">

                        <button
                          title="View Details"
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          title="Edit User"
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600"
                        >
                          <Edit size={16} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    No members found in Firestore database.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* Mobile View */}
        <div className="block md:hidden divide-y divide-gray-200 p-3">

          {filteredUsers.length > 0 ? (

            filteredUsers.map((user) => (

              <div key={user.id} className="py-3.5 space-y-2">

                <div className="flex items-center justify-between">

                  <div>
                    <span className="font-bold text-gray-900 text-sm">
                      {user.id}
                    </span>
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {user.name}
                    </h3>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    user.status === "Admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {user.status}
                  </span>

                </div>

                <div className="text-xs text-gray-500 flex justify-between items-center">
                  <span>Mobile: {user.mobile}</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                    {user.level}
                  </span>
                </div>

                <div className="text-xs text-gray-400 truncate">
                  {user.email}
                </div>

              </div>

            ))

          ) : (

            <p className="py-8 text-center text-xs text-gray-500">
              No members found in Firestore database.
            </p>

          )}

        </div>

      </div>

    </div>
  );
}


/* ---------------- Statistics Card ---------------- */

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xl border border-gray-100">

      <p className="text-xs text-gray-500 font-medium">
        {title}
      </p>

      <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
        {value}
      </p>

    </div>
  );
}

export default Users;