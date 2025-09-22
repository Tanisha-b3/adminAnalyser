// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { initializeAuth, logout, refreshToken } from "./store/slice/authSlice";

import Sidebar from "./Components/Sidebar";
import TopNav from "./Components/TopNav";

// Pages
import Dashboard from "./pages/dashboard/Dashboard";
import CompanyUserManagement from "./pages/dashboard/CompanyUserManagement";
import AdminProjectList from "./pages/dashboard/AdminProjectList";
import BillingList from "./pages/dashboard/BillingList";
import TenantUserManager from "./pages/dashboard/TenantUserManager";
import AdminSupportDesk from "./pages/dashboard/AdminSupportDesk";
import AdminBillingConsole from "./pages/dashboard/AdminBillingConsole";
import AdminAuditTracker from "./pages/dashboard/AdminAuditTracker";
import AddTenant from "./pages/dashboard/components/Addtenant";
import TenantDetail from "./pages/dashboard/components/TenantDetail";
import SuperAdminLogin from "./pages/login/SuperAdminLogin";
import ProtectedRoute from "./pages/login/ProtectedRoute";
import Plan from "./pages/dashboard/plan";
import TenantP from "./pages/dashboard/TenantCreate";
import Issue from "./issue/issue";
import { Ticket } from "lucide-react";
import TicketSuperAdmin from "./issue/ticket";

// Layout component for protected routes
const ProtectedLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 h-full overflow-y-auto bg-gradient-to-br from-zinc-900/80 via-black/50 to-zinc-900/40 border-l border-zinc-800/50 backdrop-blur-sm">
        <TopNav />
        <div className="p-8 min-h-full">{children}</div>
      </div>
    </div>
  );
};

// Auto-refresh token component
const AutoRefreshToken = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await dispatch(refreshToken()).unwrap();
        console.log("Token refreshed");
      } catch {
        dispatch(logout());
      }
    }, 5 * 60 * 1000); // refresh every 5 minutes

    return () => clearInterval(interval);
  }, [dispatch]);

  return null;
};

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAppInitialized, setIsAppInitialized] = useState(false);

  const { isAuthenticated, status } = useSelector((state) => state.auth);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if we have stored tokens
        const storedToken = localStorage.getItem("SuperAdminToken");
        const storedUser = localStorage.getItem("SuperAdminUser");

        if (storedToken && storedUser) {
          // Attempt to initialize auth with stored tokens
          await dispatch(initializeAuth()).unwrap();
        }
      } catch (error) {
        console.error("App initialization failed:", error);
        // If initialization fails and we're not on login page, redirect
        if (!location.pathname.includes("/login")) {
          navigate("/superadmin/login");
        }
      } finally {
        setIsAppInitialized(true);
      }
    };

    initializeApp();
  }, [dispatch, navigate, location.pathname]);

  // Redirect to dashboard if authenticated and on login page
  useEffect(() => {
    if (isAuthenticated && location.pathname === "/superadmin/login") {
      navigate("/dashboard");
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Show loading screen while app is initializing
  if (!isAppInitialized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Routes>
        {/* Public Route */}
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Super Admin Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 overflow-hidden">
                <Sidebar />
                <div className="flex-1 h-full overflow-y-auto bg-gradient-to-br from-zinc-900/80 via-black/50 to-zinc-900/40 border-l border-zinc-800/50 backdrop-blur-sm">
                  <TopNav />
                  <div className="p-8 min-h-full">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/tenant/add" element={<AddTenant />} />
                      <Route path="/tenant/:id" element={<TenantDetail />} />
                      <Route
                        path="/usermanagement"
                        element={<CompanyUserManagement />}
                      />
                      <Route
                        path="/AdminProjectList"
                        element={<AdminProjectList />}
                      />
                      <Route path="/BillingList" element={<BillingList />} />
                      <Route
                        path="/TenantUserManager"
                        element={<TenantUserManager />}
                      />
                      <Route
                        path="/AdminSupportDesk"
                        element={<AdminSupportDesk />}
                      />
                      <Route
                        path="/AdminAuditTracker"
                        element={<AdminAuditTracker />} 
                      />
                      <Route
                        path="/AdminBillingConsole"
                        element={<AdminBillingConsole />}
                      />
                    </Routes>
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path ="/issue" element={
          <ProtectedLayout>
            <Issue />
          </ProtectedLayout>
        }/>
         <Route path ="/ticket" element={
          <ProtectedLayout>
            <TicketSuperAdmin />
          </ProtectedLayout>
        }/>
      </Routes>
      
    </div>
  );
}

export default App;