import {
  LayoutDashboard,
  Users,
  UserPlus,
  CreditCard,
  UsersRound,
  Banknote,
  Wallet,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function AdminSidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "Add User",
      path: "/admin/add-user",
      icon: UserPlus,
    },
    {
      name: "Payments",
      path: "/admin/payments",
      icon: CreditCard,
    },
    {
      name: "Team Management",
      path: "/admin/team",
      icon: UsersRound,
    },
    {
      name: "Payout / Income",
      path: "/admin/income",
      icon: Banknote,
    },
    {
      name: "Withdrawal Requests",
      path: "/admin/withdrawals",
      icon: Wallet,
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white text-black border-r border-gray-200 flex flex-col">

      {/* COMPANY LOGO */}

      <div className="h-20 flex items-center justify-center border-b border-gray-200">

        <h1 className="text-xl font-bold text-[#B8860B]">
          COMPANY NAME
        </h1>

      </div>


      {/* ADMIN LABEL */}

      <div className="px-5 pt-5 pb-2">

        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Admin Panel
        </p>

      </div>


      {/* MENU */}

      <nav className="p-4 space-y-2 flex-1">

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

              <span>
                {item.name}
              </span>

            </NavLink>
          );

        })}


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

export default AdminSidebar;