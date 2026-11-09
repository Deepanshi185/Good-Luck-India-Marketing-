import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { Menu, X } from "lucide-react";

function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#120604] flex flex-col md:flex-row w-full max-w-full overflow-x-hidden">
      
      {/* 📱 MOBILE HEADER BAR (Visible only on mobile) */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
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

      {/* 📱 MOBILE NAVIGATION SLIDE-OUT DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[53px] z-30 bg-black/75 backdrop-blur-sm flex flex-col">
          <div className="bg-white w-full shadow-2xl rounded-b-2xl max-h-[85vh] overflow-y-auto">
            <AdminSidebar onNavItemClick={() => setMobileMenuOpen(false)} />
          </div>
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
        <main className="p-3 sm:p-6 lg:p-8 flex-1 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

export default AdminLayout;