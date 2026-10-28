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
} from "lucide-react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const [profileOpen, setProfileOpen] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Team",
      path: "/team",
      icon: Users,
    },
    {
      name: "Installments",
      path: "/installments",
      icon: CreditCard,
    },
    {
      name: "Income",
      path: "/income",
      icon: Banknote,
    },
    {
      name: "Withdraw",
      path: "/withdraw",
      icon: Wallet,
    },
    {
      name: "Payment Status",
      path: "/payment-status",
      icon: CreditCard,
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white text-black border-r border-gray-200 flex flex-col">

      {/* LOGO / COMPANY NAME */}
      <div className="h-20 flex items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-[#B8860B]">
          COMPANY NAME
        </h1>
      </div>

      {/* MENU */}
      <nav className="p-4 space-y-2 flex-1">

        {/* MAIN MENU */}
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gray-200 text-black"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <Icon size={21} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        {/* PERSONAL INFORMATION */}
        <div>

          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >

            <div className="flex items-center gap-4">
              <User size={21} />

              <span>
                Personal Info
              </span>
            </div>

            {profileOpen ? (
              <ChevronDown size={19} />
            ) : (
              <ChevronRight size={19} />
            )}

          </button>

          {/* PERSONAL INFO SUBMENU */}
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
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-all duration-200 mt-6"
        >
          <LogOut size={21} />

          <span>
            Logout
          </span>
        </button>

      </nav>

    </aside>
  );
}

export default Sidebar;