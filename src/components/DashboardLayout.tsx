import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#120604]">

      <div className="flex">

        {/* SIDEBAR */}

        <Sidebar />


        {/* RIGHT SIDE */}

        <div className="flex-1 min-h-screen">

          <Topbar />

          <main className="p-6">

            <Outlet />

          </main>

        </div>

      </div>

    </div>
  );
}

export default DashboardLayout;