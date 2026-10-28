function Profile() {
  const user = {
    userId: "AS0000",
    name: "User Name",
    email: "user@example.com",
    mobile: "XXXXXXXXXX",
    pan: "XXXXXXXXXX",
    bankDetails: "Not Added",
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Personal Info
        </h1>

        <p className="text-gray-400 mt-1">
          View your personal information
        </p>
      </div>


      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#FFD21C] to-[#F59E0B] p-8">

          <div className="flex items-center gap-5">

            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center">

              <span className="text-3xl font-bold text-[#D4AF37]">
                {user.name.charAt(0)}
              </span>

            </div>

            <div>
              <h2 className="text-2xl font-bold text-black">
                {user.name}
              </h2>

              <p className="text-black/70 mt-1">
                User ID: {user.userId}
              </p>
            </div>

          </div>

        </div>


        {/* Personal Information */}
        <div className="p-8">

          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Personal Information
          </h3>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">

            <ProfileRow
              label="User ID"
              value={user.userId}
            />

            <ProfileRow
              label="Name"
              value={user.name}
            />

            <ProfileRow
              label="Email ID"
              value={user.email}
            />

            <ProfileRow
              label="Mobile"
              value={user.mobile}
            />

            <ProfileRow
              label="PAN"
              value={user.pan}
            />

            <ProfileRow
              label="Bank Details"
              value={user.bankDetails}
            />

          </div>

        </div>

      </div>

    </div>
  );
}


function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-gray-200 py-5">

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="text-lg font-semibold text-gray-900 mt-1">
        {value}
      </p>

    </div>
  );
}


export default Profile;