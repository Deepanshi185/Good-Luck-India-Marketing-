import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row w-full max-w-full overflow-x-hidden">
      
      {/* DESKTOP SIDEBAR */}
      <Sidebar />

      {/* RIGHT SIDE MAIN CONTENT AREA */}
      <div className="flex-1 min-h-screen min-w-0 flex flex-col bg-gray-50">

        {/* TOPBAR */}
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

        {/* PAGE CONTENT CONTAINER */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-full overflow-x-hidden bg-gray-50">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;