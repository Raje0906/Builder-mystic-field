// React import not needed with React 17+
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "@/pages/SimpleDashboard";
import SalesInventory from "@/pages/SimpleSalesInventory";
import { SalesCustomers } from "@/pages/sales/SalesCustomers";
import { NewSale } from "@/pages/sales/NewSale";
import SalesOverview from "@/pages/SalesOverview";
import RepairsOverview from "@/pages/SimpleRepairs";
import { NewRepair } from "@/pages/repairs/NewRepair";
import { TrackRepair } from "@/pages/repairs/TrackRepair";
import ReportsOverview from "@/pages/SimpleReports";
import { SalesReports } from "@/pages/reports/SalesReports";
import { RepairReports } from "@/pages/reports/RepairReports";
import { StoreReports } from "@/pages/reports/StoreReports";
import CustomerManagement from "@/pages/OfflineAwareCustomers";
import InventoryPage from "@/pages/inventory/InventoryPage";
import InventoryForm from "@/pages/inventory/InventoryForm";
import TestPage from "@/pages/TestPage";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />

            {/* Sales Routes */}
            <Route path="sales" element={<SalesOverview />} />
            <Route path="sales/inventory" element={<SalesInventory />} />
            <Route path="sales/customers" element={<SalesCustomers />} />
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
            <Route path="inventory">
              <Route index element={<InventoryPage />} />
              <Route path="new" element={<InventoryForm />} />
              <Route path=":id" element={<InventoryForm />} />
              <Route path=":id/edit" element={<InventoryForm />} />
            </Route>
            <Route path="test" element={<TestPage />} />

            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
