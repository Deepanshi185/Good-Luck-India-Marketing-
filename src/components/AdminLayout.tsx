import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { Menu, X } from "lucide-react";

function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row w-full max-w-full overflow-x-hidden">
      {/* MOBILE HEADER BAR */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FFD21C] to-[#F59E0B] flex items-center justify-center font-bold text-gray-950 text-xs shadow-sm">
            A
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 leading-none">
              Admin Panel
            </h2>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Management Portal
            </p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 transition cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* MOBILE NAVIGATION SLIDE-OUT DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[53px] z-30 bg-slate-900/40 backdrop-blur-xs flex flex-col">
          <div className="bg-white w-full shadow-xl rounded-b-2xl max-h-[85vh] overflow-y-auto">
            <AdminSidebar onNavItemClick={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex shrink-0">
        <AdminSidebar />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-h-screen min-w-0 flex flex-col bg-gray-50">
        {/* DESKTOP TOP HEADER */}
        <header className="hidden md:flex h-20 bg-white border-b border-gray-200 items-center justify-between px-6 shadow-2xs">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            <p className="text-sm text-gray-500">
              Manage your company members and payments
            </p>
          </div>

          {/* ADMIN PROFILE */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFD21C] to-[#F59E0B] flex items-center justify-center shadow-sm">
              <span className="font-bold text-gray-950">A</span>
            </div>

            <div>
              <p className="font-semibold text-gray-900 leading-tight">
                Administrator
              </p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-full overflow-x-hidden bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;