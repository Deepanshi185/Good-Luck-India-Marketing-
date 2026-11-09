import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#120604] flex flex-col md:flex-row w-full max-w-full overflow-x-hidden">

      {/* SIDEBAR & MOBILE HEADER */}
      <Sidebar />

      {/* RIGHT SIDE MAIN CONTENT AREA */}
      <div className="flex-1 min-h-screen min-w-0 flex flex-col">

        {/* TOPBAR */}
        <Topbar />

        {/* PAGE CONTENT */}
        <main className="p-3 sm:p-6 flex-1 max-w-full overflow-x-hidden">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;