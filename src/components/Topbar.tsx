import { Bell, Menu } from "lucide-react";

function Topbar() {
  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6">

      {/* LEFT */}

      <button className="p-2 rounded-full hover:bg-gray-100">
        <Menu size={24} />
      </button>


      {/* RIGHT */}

      <div className="flex items-center gap-5">

        <button className="p-2 rounded-full hover:bg-gray-100">
          <Bell size={22} />
        </button>

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center font-bold">
            U
          </div>

          <div>
            <p className="font-semibold">
              User
            </p>

            <p className="text-xs text-gray-500">
              Member
            </p>
          </div>

        </div>

      </div>

    </header>
  );
}

export default Topbar;