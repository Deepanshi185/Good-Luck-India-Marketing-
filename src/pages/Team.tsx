import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

type MemberRecord = {
  userId: string;
  fullName: string;
  mobile: string;
  referrerName: string;
};

function Team() {
  const activeUserId = localStorage.getItem("activeUserId") || "dnoenw1";
  const levels = [
    "Level 1",
    "Level 2",
    "Level 3",
    "Level 4",
    "Level 5",
    "Level 6",
  ];

  const [teamByLevel, setTeamByLevel] = useState<Record<number, MemberRecord[]>>({
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamTree() {
      try {
        setLoading(true);

        // Fetch all users where uplineChain includes activeUserId
        const q = query(
          collection(db, "users"),
          where("uplineChain", "array-contains", activeUserId)
        );
        const querySnapshot = await getDocs(q);

        const grouped: Record<number, MemberRecord[]> = {
          1: [],
          2: [],
          3: [],
          4: [],
          5: [],
          6: [],
        };

        // Collect member IDs to resolve referrer names
        const memberList: { docData: any; levelNum: number }[] = [];

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const chain: string[] = data.uplineChain || [];
          const idx = chain.indexOf(activeUserId);

          if (idx >= 0 && idx < 6) {
            const levelNum = idx + 1; // Level 1 to 6
            memberList.push({ docData: data, levelNum });
          }
        });

        // Populate table records
        for (const item of memberList) {
          const d = item.docData;
          let refName = d.referrerId || "N/A";

          // Fetch referrer name if available
          if (d.referrerId) {
            try {
              const refSnap = await getDoc(doc(db, "users", d.referrerId));
              if (refSnap.exists()) {
                refName = refSnap.data().fullName || d.referrerId;
              }
            } catch (e) {
              // fallback to ID if doc fetch fails
            }
          }

          grouped[item.levelNum].push({
            userId: d.userId || "N/A",
            fullName: d.fullName || "Member",
            mobile: d.mobile || "N/A",
            referrerName: refName,
          });
        }

        setTeamByLevel(grouped);
      } catch (err) {
        console.error("Error fetching team records:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTeamTree();
  }, [activeUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white">
        <p className="text-xl font-semibold">Loading Team Hierarchy...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Team Details</h1>
        <p className="text-gray-400 mt-1">View your team members level by level</p>
      </div>

      {/* Level Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {levels.map((level, idx) => {
          const levelNum = idx + 1;
          const count = teamByLevel[levelNum]?.length || 0;

          return (
            <div
              key={level}
              className="bg-white rounded-2xl p-5 shadow-xl text-center"
            >
              <p className="text-gray-500 font-semibold">{level}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{count}</p>
              <p className="text-sm text-gray-500 mt-1">Members</p>
            </div>
          );
        })}
      </div>

      {/* Level Details Tables */}
      {levels.map((level, idx) => {
        const levelNum = idx + 1;
        const members = teamByLevel[levelNum] || [];

        return (
          <div
            key={level}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Level Header */}
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{level}</h2>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="px-5 py-4 text-left">ID No.</th>
                    <th className="px-5 py-4 text-left">Name</th>
                    <th className="px-5 py-4 text-left">Mobile No.</th>
                    <th className="px-5 py-4 text-left">Referred By Name</th>
                  </tr>
                </thead>

                <tbody>
                  {members.length > 0 ? (
                    members.map((member, i) => (
                      <tr
                        key={`${member.userId}-${i}`}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-5 py-4 font-semibold text-gray-900">
                          {member.userId}
                        </td>
                        <td className="px-5 py-4 text-gray-800">
                          {member.fullName}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {member.mobile}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {member.referrerName}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-gray-500"
                      >
                        No members found in {level}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Team;