import { useState } from "react";
import {
  LayoutDashboard,
  User,
  Users,
  CreditCard,
  Wallet,
  Banknote,
  LogOut,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

type SidebarProps = {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
};

function Sidebar({ mobileMenuOpen, setMobileMenuOpen }: SidebarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "My Team", path: "/team", icon: Users },
    { name: "Installments", path: "/installments", icon: CreditCard },
    { name: "Income", path: "/income", icon: Banknote },
    { name: "Withdraw", path: "/withdraw", icon: Wallet },
    { name: "Payment Status", path: "/payment-status", icon: CreditCard },
  ];

  const handleLogout = () => {
    if (setMobileMenuOpen) setMobileMenuOpen(false);
    localStorage.removeItem("activeUserId");
    localStorage.removeItem("userRole");
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* 📱 MOBILE SLIDE-DOWN DRAWER MENU */}
      {mobileMenuOpen && setMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[53px] z-30 bg-black/70 backdrop-blur-sm flex flex-col">
          <nav className="bg-white w-full p-4 space-y-2 shadow-2xl rounded-b-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Member Portal
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-gray-200 text-black font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  <Icon size={20} className="text-[#B8860B]" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            {/* PERSONAL INFORMATION (MOBILE) */}
            <div>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <User size={20} className="text-[#B8860B]" />
                  <span>Personal Info</span>
                </div>
                {profileOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>

              {profileOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  <NavLink
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded-lg text-sm font-medium transition ${
                        isActive
                          ? "bg-gray-100 text-[#B8860B]"
                          : "text-gray-600 hover:bg-gray-50"
                      }`
                    }
                  >
                    View Profile
                  </NavLink>

                  <NavLink
                    to="/edit-profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded-lg text-sm font-medium transition ${
                        isActive
                          ? "bg-gray-100 text-[#B8860B]"
                          : "text-gray-600 hover:bg-gray-50"
                      }`
                    }
                  >
                    Edit Profile
                  </NavLink>
                </div>
              )}
            </div>

            {/* LOGOUT BUTTON (MOBILE) */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50 transition-all duration-200 mt-4 border-t border-gray-100 cursor-pointer"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}

      {/* 🖥️ DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 min-h-screen bg-white text-black border-r border-gray-200 flex-col shrink-0 sticky top-0">
        {/* LOGO / COMPANY NAME */}
        <div className="h-20 flex items-center justify-center border-b border-gray-200 px-4">
          <h1 className="text-sm font-extrabold text-[#B8860B] tracking-wide text-center leading-tight">
            GOOD LUCK INDIA MARKETING
          </h1>
        </div>

        {/* MENU */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            Member Portal
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-gray-200 text-black font-bold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <Icon size={20} className="text-[#B8860B]" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          {/* PERSONAL INFORMATION */}
          <div>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <User size={20} className="text-[#B8860B]" />
                <span>Personal Info</span>
              </div>
              {profileOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>

            {profileOpen && (
              <div className="ml-8 mt-1 space-y-1">
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-gray-100 text-[#B8860B]"
                        : "text-gray-600 hover:bg-gray-50"
                    }`
                  }
                >
                  View Profile
                </NavLink>

                <NavLink
                  to="/edit-profile"
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-gray-100 text-[#B8860B]"
                        : "text-gray-600 hover:bg-gray-50"
                    }`
                  }
                >
                  Edit Profile
                </NavLink>
              </div>
            )}
          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50 transition-all duration-200 mt-6 border-t border-gray-100 cursor-pointer"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;