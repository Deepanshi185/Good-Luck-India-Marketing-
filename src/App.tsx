import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import DashboardLayout from "./components/DashboardLayout";
import AdminLayout from "./components/AdminLayout";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Team from "./pages/Team";
import Installments from "./pages/Installments";
import Login from "./pages/Login";
import Income from "./pages/Income";
import Withdraw from "./pages/Withdraw";
import PaymentStatus from "./pages/PaymentStatus";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import AddUser from "./pages/admin/AddUser";
import Payments from "./pages/admin/Payments";
import MonthlyPayments from "./pages/admin/MonthlyPayments"; // 👈 1. Import the new 21-Month tracker page
import TeamManagement from "./pages/admin/TeamManagement";
import Withdrawals from "./pages/admin/Withdrawals";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC / ENTRANCE ROUTES ================= */}
        <Route path="/login" element={<Login />} />
        
        {/* DEFAULT ROUTE REDIRECTS TO LOGIN FIRST */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ================= USER PANEL (MEMBER DASHBOARD) ================= */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/team" element={<Team />} />
          <Route path="/installments" element={<Installments />} />
          <Route path="/income" element={<Income />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/payment-status" element={<PaymentStatus />} />
        </Route>

        {/* ================= ADMIN PANEL ================= */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/add-user" element={<AddUser />} />
          <Route path="/admin/payments" element={<Payments />} />
          <Route path="/admin/monthly-payments" element={<MonthlyPayments />} /> {/* 👈 2. Add route here */}
          <Route path="/admin/team" element={<TeamManagement />} />
          <Route path="/admin/income" element={<div>Admin Income</div>} />
          <Route path="/admin/withdrawals" element={<Withdrawals />} />
        </Route>

        {/* ================= UNKNOWN PAGE FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;