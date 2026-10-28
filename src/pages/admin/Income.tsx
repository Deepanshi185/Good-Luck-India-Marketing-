import { useState } from "react";

type IncomeRecord = {
  date: string;
  id: string;
  name: string;
  level: number;
  income: number;
  installment: number;
};

function Income() {
  const [selectedLevel, setSelectedLevel] = useState("All");

  // Temporary sample data.
  // Later this will come from the backend/database.
  const incomeRecords: IncomeRecord[] = [
    {
      date: "08/09/2026",
      id: "AS0001",
      name: "Member One",
      level: 1,
      income: 200,
      installment: 1,
    },
    {
      date: "08/10/2026",
      id: "AS0002",
      name: "Member Two",
      level: 2,
      income: 100,
      installment: 2,
    },
    {
      date: "08/10/2026",
      id: "AS0003",
      name: "Member Three",
      level: 3,
      income: 50,
      installment: 2,
    },
    {
      date: "08/10/2026",
      id: "AS0004",
      name: "Member Four",
      level: 4,
      income: 50,
      installment: 2,
    },
    {
      date: "08/10/2026",
      id: "AS0005",
      name: "Member Five",
      level: 5,
      income: 50,
      installment: 2,
    },
    {
      date: "08/10/2026",
      id: "AS0006",
      name: "Member Six",
      level: 6,
      income: 50,
      installment: 2,
    },
  ];

  const filteredRecords =
    selectedLevel === "All"
      ? incomeRecords
      : incomeRecords.filter(
          (record) => record.level === Number(selectedLevel)
        );

  const totalIncome = filteredRecords.reduce(
    (total, record) => total + record.income,
    0
  );

  const levelIncome = (level: number) =>
    incomeRecords
      .filter((record) => record.level === level)
      .reduce((total, record) => total + record.income, 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          My Income
        </h1>

        <p className="text-gray-400 mt-1">
          View income earned from your team
        </p>
      </div>


      {/* Total Income */}
      <div className="bg-gradient-to-r from-[#FFD21C] to-[#C99420] rounded-2xl p-6 shadow-xl">

        <p className="text-sm font-semibold text-black/70">
          Total Team Income
        </p>

        <p className="text-4xl font-bold text-black mt-2">
          ₹{totalIncome}
        </p>

        <p className="text-sm text-black/70 mt-2">
          Total income generated through your team
        </p>

      </div>


      {/* Level Income Cards */}
      <div>

        <h2 className="text-xl font-bold text-white mb-4">
          Level-wise Income
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">

          {[1, 2, 3, 4, 5, 6].map((level) => (

            <div
              key={level}
              className="bg-white rounded-2xl p-5 shadow-xl"
            >

              <p className="text-sm text-gray-500">
                Level {level}
              </p>

              <p className="text-2xl font-bold text-gray-900 mt-2">
                ₹{levelIncome(level)}
              </p>

            </div>

          ))}

        </div>

      </div>


      {/* Income Structure */}
      <div className="bg-white rounded-2xl shadow-xl p-6">

        <h2 className="text-xl font-bold text-gray-900 mb-5">
          Income Structure
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* First Installment */}
          <div className="border border-gray-200 rounded-xl p-5">

            <div className="flex items-center justify-between">

              <h3 className="font-bold text-gray-900">
                1st Installment
              </h3>

              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                Level 1
              </span>

            </div>

            <p className="text-3xl font-bold text-green-600 mt-3">
              ₹200
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Income from Level 1
            </p>

          </div>


          {/* Second Installment */}
          <div className="border border-gray-200 rounded-xl p-5">

            <div className="flex items-center justify-between">

              <h3 className="font-bold text-gray-900">
                2nd Installment
              </h3>

              <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">
                Level 2–6
              </span>

            </div>

            <p className="text-3xl font-bold text-green-600 mt-3">
              ₹300
            </p>

            <p className="text-sm text-gray-500 mt-1">
              L2 ₹100 · L3 ₹50 · L4 ₹50 · L5 ₹50 · L6 ₹50
            </p>

          </div>

        </div>

      </div>


      {/* Income History */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-gray-200">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <h2 className="text-xl font-bold text-gray-900">
                Income History
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Income earned from individual team members
              </p>

            </div>


            {/* Filter */}
            <select
              value={selectedLevel}
              onChange={(e) =>
                setSelectedLevel(e.target.value)
              }
              className="border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#D4AF37]"
            >

              <option value="All">
                All Levels
              </option>

              <option value="1">
                Level 1
              </option>

              <option value="2">
                Level 2
              </option>

              <option value="3">
                Level 3
              </option>

              <option value="4">
                Level 4
              </option>

              <option value="5">
                Level 5
              </option>

              <option value="6">
                Level 6
              </option>

            </select>

          </div>

        </div>


        {/* Table */}
        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-black text-white">

                <th className="px-6 py-4 text-left">
                  Date
                </th>

                <th className="px-6 py-4 text-left">
                  ID No.
                </th>

                <th className="px-6 py-4 text-left">
                  Name
                </th>

                <th className="px-6 py-4 text-center">
                  Level
                </th>

                <th className="px-6 py-4 text-center">
                  Installment
                </th>

                <th className="px-6 py-4 text-right">
                  Income
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredRecords.length > 0 ? (

                filteredRecords.map((record, index) => (

                  <tr
                    key={`${record.id}-${index}`}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >

                    <td className="px-6 py-4 text-gray-600">
                      {record.date}
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      {record.id}
                    </td>

                    <td className="px-6 py-4">
                      {record.name}
                    </td>

                    <td className="px-6 py-4 text-center">

                      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">
                        Level {record.level}
                      </span>

                    </td>

                    <td className="px-6 py-4 text-center text-gray-600">
                      {record.installment === 1
                        ? "1st"
                        : "2nd"}
                    </td>

                    <td className="px-6 py-4 text-right font-bold text-green-600">
                      ₹{record.income}
                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No income records found.
                  </td>

                </tr>

              )}

            </tbody>


            {/* Total */}
            {filteredRecords.length > 0 && (

              <tfoot>

                <tr className="bg-gray-50">

                  <td
                    colSpan={5}
                    className="px-6 py-5 text-right font-bold text-gray-900"
                  >
                    Total Income
                  </td>

                  <td className="px-6 py-5 text-right font-bold text-green-600 text-lg">
                    ₹{totalIncome}
                  </td>

                </tr>

              </tfoot>

            )}

          </table>

        </div>

      </div>


      {/* Note */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-5">

        <p className="font-semibold text-yellow-800">
          Income Calculation
        </p>

        <p className="text-sm text-yellow-700 mt-1">
          Level 1 income of ₹200 is generated on the
          first installment. Level 2 to Level 6 income
          is generated on the second installment.
        </p>

      </div>

    </div>
  );
}

export default Income;