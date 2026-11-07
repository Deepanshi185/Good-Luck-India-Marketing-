import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  UserPlus,
  CreditCard,
  Network,
  Wallet,
  ArrowDownRight,
  LogOut,
} from "lucide-react";

function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const adminMenuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Add User", path: "/admin/add-user", icon: UserPlus },
    { name: "Payments", path: "/admin/payments", icon: CreditCard },
    { name: "Team Management", path: "/admin/team", icon: Network },
    { name: "Payout / Income", path: "/admin/payout", icon: Wallet },
    { name: "Withdrawal Requests", path: "/admin/withdrawals", icon: ArrowDownRight },
  ];

  const handleLogout = () => {
    setMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#120604] flex flex-col md:flex-row w-full max-w-full overflow-x-hidden">
      
      {/* 📱 MOBILE HEADER BAR (Visible only on mobile) */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center font-bold text-black text-xs shadow">
            A
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 leading-none">Admin Panel</h2>
            <p className="text-[10px] text-gray-500 mt-0.5">Management Portal</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* 📱 MOBILE NAVIGATION DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[53px] z-30 bg-black/70 backdrop-blur-sm flex flex-col">
          <nav className="bg-white w-full p-4 space-y-1.5 shadow-2xl rounded-b-2xl max-h-[80vh] overflow-y-auto">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2 px-3">
              Admin Navigation
            </p>
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? "bg-gray-200 text-black font-bold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={19} className={isActive ? "text-[#D4AF37]" : "text-gray-500"} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition mt-4 border-t border-gray-100"
            >
              <LogOut size={19} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}

      {/* 🖥️ DESKTOP SIDEBAR (Hidden on mobile) */}
      <div className="hidden md:flex shrink-0">
        <AdminSidebar />
      </div>

      {/* 📄 MAIN CONTENT AREA */}
      <div className="flex-1 min-h-screen min-w-0 flex flex-col">
        
        {/* DESKTOP TOP HEADER */}
        <header className="hidden md:flex h-20 bg-white border-b border-gray-200 items-center justify-between px-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            <p className="text-sm text-gray-500">Manage your company members and payments</p>
          </div>

          {/* ADMIN PROFILE */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center">
              <span className="font-bold text-black">A</span>
            </div>

            <div>
              <p className="font-semibold text-gray-900 leading-tight">Administrator</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="p-3 sm:p-6 flex-1 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

export default AdminLayout;