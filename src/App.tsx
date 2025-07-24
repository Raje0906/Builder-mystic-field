// React import not needed with React 17+
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Login } from "@/pages/Login";
import Dashboard from "@/pages/SimpleDashboard";
import { SalesCustomers } from "@/pages/sales/SalesCustomers";
import { NewSale } from "@/pages/sales/NewSale";
import { DailySales } from "@/pages/sales/DailySales";
import SalesOverview from "@/pages/SalesOverview";
import RepairsOverview from "@/pages/SimpleRepairs";
import { NewRepair } from "@/pages/repairs/NewRepair";
import { TrackRepair } from "@/pages/repairs/TrackRepair";
import ReportsOverview from "@/pages/SimpleReports";
import { SalesReports } from "@/pages/reports/SalesReports";
import { RepairReports } from "@/pages/reports/RepairReports";
import { StoreReports } from "@/pages/reports/StoreReports";
import CustomerManagement from "@/pages/CustomerManagement";
import TestPage from "@/pages/TestPage";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import UserManagement from "@/pages/UserManagement";
import { toast } from "@/hooks/use-toast";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />

              {/* Sales Routes */}
              <Route path="sales" element={<SalesOverview />} />
              <Route path="sales/customers" element={<SalesCustomers />} />
              <Route path="sales/daily" element={<DailySales />} />
              <Route path="sales/new" element={<NewSale />} />

              {/* Repair Routes */}
              <Route path="repairs" element={<RepairsOverview />} />
              <Route path="repairs/new" element={<NewRepair />} />
              <Route path="repairs/track" element={<TrackRepair />} />

              {/* Report Routes */}
              <Route path="reports" element={<ReportsOverview />} />
              <Route path="reports/sales" element={<SalesReports />} />
              <Route path="reports/repairs" element={<RepairReports />} />
              <Route path="reports/stores" element={<StoreReports />} />

              {/* Other Routes */}
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="test" element={<TestPage />} />

              {/* Admin-only: User Management */}
              <Route path="users" element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <UserManagement />
                </ProtectedRoute>
              } />
            </Route>

            {/* Catch-all route for 404 - outside protected routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
