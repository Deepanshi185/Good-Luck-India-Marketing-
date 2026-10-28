import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#120604]">

      <div className="flex">

        {/* ADMIN SIDEBAR */}
        <AdminSidebar />


        {/* RIGHT SIDE */}
        <div className="flex-1 min-h-screen">

          {/* TOP BAR */}
          <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6">

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Admin Panel
              </h2>

              <p className="text-sm text-gray-500">
                Manage your company members and payments
              </p>
            </div>


            {/* ADMIN PROFILE */}
            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center">
                <span className="font-bold text-black">
                  A
                </span>
              </div>

              <div className="hidden sm:block">

                <p className="font-semibold text-gray-900">
                  Administrator
                </p>

                <p className="text-xs text-gray-500">
                  Admin
                </p>

              </div>

            </div>

          </header>


          {/* PAGE CONTENT */}
          <main className="p-6">

            <Outlet />

          </main>

        </div>

      </div>

    </div>
  );
}

export default AdminLayout;