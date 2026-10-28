function AdminDashboard() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Admin Dashboard
        </h1>

        <p className="text-gray-400 mt-1">
          Overview of your company and members
        </p>
      </div>


      {/* Main Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        <DashboardCard
          title="Total Users"
          value="0"
        />

        <DashboardCard
          title="Active Users"
          value="0"
        />

        <DashboardCard
          title="Total Team Members"
          value="0"
        />

        <DashboardCard
          title="Total Income"
          value="₹0"
        />

      </div>


      {/* Payment & Withdrawal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <DashboardSection title="Payment Overview">

          <DashboardRow
            label="Total Payments"
            value="0"
          />

          <DashboardRow
            label="Paid Payments"
            value="0"
          />

          <DashboardRow
            label="Pending Payments"
            value="0"
          />

        </DashboardSection>


        <DashboardSection title="Withdrawal Overview">

          <DashboardRow
            label="Total Requests"
            value="0"
          />

          <DashboardRow
            label="Pending Requests"
            value="0"
          />

          <DashboardRow
            label="Completed Requests"
            value="0"
          />

        </DashboardSection>

      </div>


      {/* Team Levels */}
      <div className="bg-white rounded-2xl shadow-xl p-6">

        <h2 className="text-xl font-bold text-gray-900 mb-5">
          Team Level Overview
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">

          <LevelCard level="Level 1" members="0" />
          <LevelCard level="Level 2" members="0" />
          <LevelCard level="Level 3" members="0" />
          <LevelCard level="Level 4" members="0" />
          <LevelCard level="Level 5" members="0" />
          <LevelCard level="Level 6" members="0" />

        </div>

      </div>


      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-xl p-6">

        <h2 className="text-xl font-bold text-gray-900 mb-5">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-4">

          <button className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#FFD21C] to-[#C99420] text-black font-bold">
            Add New User
          </button>

          <button className="px-5 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-100">
            Manage Payments
          </button>

          <button className="px-5 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-100">
            Withdrawal Requests
          </button>

        </div>

      </div>

    </div>
  );
}


/* ---------------- Dashboard Card ---------------- */

function DashboardCard({
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


/* ---------------- Dashboard Section ---------------- */

function DashboardSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">

      <h2 className="text-xl font-bold text-gray-900 mb-5">
        {title}
      </h2>

      <div className="space-y-4">
        {children}
      </div>

    </div>
  );
}


/* ---------------- Dashboard Row ---------------- */

function DashboardRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between border-b border-gray-200 pb-3">

      <span className="text-gray-500">
        {label}
      </span>

      <span className="font-bold text-gray-900">
        {value}
      </span>

    </div>
  );
}


/* ---------------- Level Card ---------------- */

function LevelCard({
  level,
  members,
}: {
  level: string;
  members: string;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 text-center">

      <p className="font-semibold text-gray-600">
        {level}
      </p>

      <p className="text-2xl font-bold text-gray-900 mt-2">
        {members}
      </p>

      <p className="text-xs text-gray-500">
        Members
      </p>

    </div>
  );
}


export default AdminDashboard;