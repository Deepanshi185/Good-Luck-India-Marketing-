import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#120604] flex flex-col md:flex-row w-full max-w-full overflow-x-hidden">
      
      {/* DESKTOP SIDEBAR */}
      <Sidebar />

      {/* RIGHT SIDE MAIN CONTENT AREA */}
      <div className="flex-1 min-h-screen min-w-0 flex flex-col">

        {/* TOPBAR (Passes mobile menu state so Topbar's hamburger button opens the Sidebar drawer) */}
        <Topbar 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
        />

        {/* MOBILE DRAWER PASSED TO SIDEBAR */}
        <div className="md:hidden">
          <Sidebar 
            mobileMenuOpen={mobileMenuOpen} 
            setMobileMenuOpen={setMobileMenuOpen} 
          />
        </div>

        {/* PAGE CONTENT */}
        <main className="p-3 sm:p-6 flex-1 max-w-full overflow-x-hidden">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;