import { useState } from "react";
import { Search, Eye, Edit } from "lucide-react";

function Users() {
  const [search, setSearch] = useState("");

  const users = [
    {
      id: "AS0001",
      name: "User Name",
      email: "user@example.com",
      mobile: "XXXXXXXXXX",
      level: "Level 1",
      group: "Group A",
      status: "Active",
    },
    {
      id: "AS0002",
      name: "Another User",
      email: "another@example.com",
      mobile: "XXXXXXXXXX",
      level: "Level 2",
      group: "Group A",
      status: "Active",
    },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.id.toLowerCase().includes(search.toLowerCase()) ||
      user.mobile.includes(search)
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Users
        </h1>

        <p className="text-gray-400 mt-1">
          View and manage registered members
        </p>
      </div>


      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <StatCard
          title="Total Users"
          value={users.length.toString()}
        />

        <StatCard
          title="Active Users"
          value={
            users
              .filter((user) => user.status === "Active")
              .length.toString()
          }
        />

        <StatCard
          title="Inactive Users"
          value={
            users
              .filter((user) => user.status === "Inactive")
              .length.toString()
          }
        />

      </div>


      {/* User Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Table Header */}
        <div className="p-6 border-b border-gray-200">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Registered Users
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Manage member information
              </p>
            </div>


            {/* Search */}
            <div className="relative w-full md:w-80">

              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search by ID, name or mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#D4AF37]"
              />

            </div>

          </div>

        </div>


        {/* Table */}
        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-black text-white">

                <th className="px-5 py-4 text-left">
                  ID No.
                </th>

                <th className="px-5 py-4 text-left">
                  Name
                </th>

                <th className="px-5 py-4 text-left">
                  Mobile
                </th>

                <th className="px-5 py-4 text-left">
                  Level
                </th>

                <th className="px-5 py-4 text-left">
                  Group
                </th>

                <th className="px-5 py-4 text-left">
                  Status
                </th>

                <th className="px-5 py-4 text-center">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredUsers.length > 0 ? (

                filteredUsers.map((user) => (

                  <tr
                    key={user.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >

                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {user.id}
                    </td>

                    <td className="px-5 py-4">
                      {user.name}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {user.mobile}
                    </td>

                    <td className="px-5 py-4">

                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">
                        {user.level}
                      </span>

                    </td>

                    <td className="px-5 py-4">
                      {user.group}
                    </td>

                    <td className="px-5 py-4">

                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                        {user.status}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <div className="flex justify-center gap-2">

                        <button
                          title="View User"
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          title="Edit User"
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
                        >
                          <Edit size={18} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    No users found.
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


/* ---------------- Statistics Card ---------------- */

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="text-3xl font-bold text-gray-900 mt-2">
        {value}
      </p>

    </div>
  );
}


export default Users;