import {
  LayoutDashboard,
  Users,
  UserPlus,
  CreditCard,
  UsersRound,
  Banknote,
  Wallet,
  Calendar,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

type AdminSidebarProps = {
  onNavItemClick?: () => void;
};

function AdminSidebar({ onNavItemClick }: AdminSidebarProps) {
  const navigate = useNavigate();

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
      name: "Team Management",
      path: "/admin/team",
      icon: UsersRound,
    },
    {
      name: "Level Commissions",
      path: "/admin/payments",
      icon: CreditCard,
    },
    {
      name: "21-Month Payments",
      path: "/admin/monthly-payments",
      icon: Calendar,
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

  const handleLogout = () => {
    if (onNavItemClick) onNavItemClick();
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="w-full md:w-64 bg-white text-black md:border-r border-gray-200 flex flex-col min-h-full">

      {/* COMPANY LOGO (Hidden on mobile drawer since header shows brand) */}
      <div className="hidden md:flex h-20 items-center justify-center border-b border-gray-200 px-4">
        <h1 className="text-lg font-bold text-[#B8860B] tracking-wider text-center">
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
      <nav className="p-3 sm:p-4 space-y-1.5 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavItemClick}
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

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50 transition-all duration-200 mt-6 border-t border-gray-100"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>

    </aside>
  );
}

export default AdminSidebar;