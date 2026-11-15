import { Bell, Menu } from "lucide-react";

type TopbarProps = {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
};

function Topbar({ mobileMenuOpen, setMobileMenuOpen }: TopbarProps) {
  return (
    <header className="h-16 sm:h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-sm">

      {/* LEFT: Mobile Hamburger Toggle */}
      <button
        onClick={() => {
          if (setMobileMenuOpen) {
            setMobileMenuOpen(!mobileMenuOpen);
          }
        }}
        className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 hover:bg-gray-100 transition md:hidden cursor-pointer"
        aria-label="Toggle Navigation Menu"
      >
        <Menu size={22} />
      </button>

      {/* Desktop spacing placeholder */}
      <div className="hidden md:block">
        <h2 className="text-base font-bold text-gray-800">Member Portal</h2>
      </div>

      {/* RIGHT: Notifications & User Profile */}
      <div className="flex items-center gap-3 sm:gap-5">

        <button className="p-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition text-gray-700 cursor-pointer">
          <Bell size={20} />
        </button>

        <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#FFD21C] to-[#F59E0B] flex items-center justify-center font-bold text-black text-sm shadow-sm">
            U
          </div>

          <div className="hidden sm:block">
            <p className="font-bold text-gray-900 text-sm leading-tight">
              User
            </p>
            <p className="text-[11px] text-gray-500">
              Member
            </p>
          </div>
        </div>

      </div>

    </header>
  );
}

export default Topbar;