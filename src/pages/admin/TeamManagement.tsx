import { useState } from "react";
import { Search, Users } from "lucide-react";

type TeamMember = {
  id: string;
  name: string;
  mobile: string;
  referredBy: string;
  level: number;
};

function TeamManagement() {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [search, setSearch] = useState("");

  const teamMembers: TeamMember[] = [
    {
      id: "AS0001",
      name: "User Name",
      mobile: "XXXXXXXXXX",
      referredBy: "Admin",
      level: 1,
    },
    {
      id: "AS0002",
      name: "Another User",
      mobile: "XXXXXXXXXX",
      referredBy: "User Name",
      level: 2,
    },
    {
      id: "AS0003",
      name: "Third User",
      mobile: "XXXXXXXXXX",
      referredBy: "Another User",
      level: 3,
    },
  ];

  const levelMembers = teamMembers.filter(
    (member) => member.level === selectedLevel
  );

  const filteredMembers = levelMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.id.toLowerCase().includes(search.toLowerCase()) ||
      member.mobile.includes(search)
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Team Management
        </h1>

        <p className="text-gray-400 mt-1">
          View members according to their team level
        </p>
      </div>


      {/* Level Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">

        {[1, 2, 3, 4, 5, 6].map((level) => {

          const count = teamMembers.filter(
            (member) => member.level === level
          ).length;

          return (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`rounded-2xl p-5 text-left shadow-xl transition ${
                selectedLevel === level
                  ? "bg-gradient-to-r from-[#FFD21C] to-[#C99420] text-black"
                  : "bg-white text-gray-900 hover:bg-gray-100"
              }`}
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-semibold">
                    Level {level}
                  </p>

                  <p className="text-3xl font-bold mt-2">
                    {count}
                  </p>

                  <p className="text-xs mt-1 opacity-70">
                    Members
                  </p>

                </div>

                <Users size={25} />

              </div>

            </button>
          );
        })}

      </div>


      {/* Selected Level */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-gray-200">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <h2 className="text-xl font-bold text-gray-900">
                Level {selectedLevel} Team
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Members belonging to Level {selectedLevel}
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
                placeholder="Search ID or name..."
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

                <th className="px-6 py-4 text-left">
                  ID No.
                </th>

                <th className="px-6 py-4 text-left">
                  Name
                </th>

                <th className="px-6 py-4 text-left">
                  Mobile No.
                </th>

                <th className="px-6 py-4 text-left">
                  Referred By Name
                </th>

                <th className="px-6 py-4 text-center">
                  Level
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredMembers.length > 0 ? (

                filteredMembers.map((member) => (

                  <tr
                    key={member.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >

                    <td className="px-6 py-4 font-semibold">
                      {member.id}
                    </td>

                    <td className="px-6 py-4">
                      {member.name}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {member.mobile}
                    </td>

                    <td className="px-6 py-4">
                      {member.referredBy}
                    </td>

                    <td className="px-6 py-4 text-center">

                      <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">
                        Level {member.level}
                      </span>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No members found in Level {selectedLevel}.
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

export default TeamManagement;