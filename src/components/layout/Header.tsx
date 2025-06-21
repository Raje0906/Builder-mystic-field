import React from "react";
import { useLocation } from "react-router-dom";
import { Bell, Search, Settings, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getPageTitle = (pathname: string): string => {
  const pathMap: Record<string, string> = {
    "/": "Dashboard",
    "/sales": "Sales",
    "/sales/inventory": "Inventory Management",
    "/sales/customers": "Customer Search",
    "/sales/new": "New Sale",
    "/repairs": "Repair Management",
    "/repairs/new": "New Repair",
    "/repairs/track": "Track Repairs",
    "/reports": "Reports",
    "/reports/sales": "Sales Reports",
    "/reports/repairs": "Repair Reports",
    "/reports/stores": "Store Performance",
    "/customers": "Customer Management",
    "/inventory": "Inventory Overview",
  };

  return pathMap[pathname] || "Laptop Store CRM";
};

export function Header() {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-8">
      <div className="flex items-center justify-between">
        {/* Left side - Page title and breadcrumb */}
        <div className="flex items-center gap-4">
          <div className="lg:hidden w-12" />{" "}
          {/* Spacer for mobile menu button */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {pageTitle}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Laptop Store CRM</span>
              {location.pathname !== "/" && (
                <>
                  <span>/</span>
                  <span className="text-gray-900 font-medium">{pageTitle}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Online/Offline Status */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600" />
            )}
            <Badge
              variant={isOnline ? "default" : "destructive"}
              className="text-xs"
            >
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>

          {/* Search */}
          <div className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search customers, products..."
                className="pl-10 w-64"
              />
            </div>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs p-0 flex items-center justify-center"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Repair Completed</p>
                  <p className="text-xs text-gray-500">
                    Amit Singh's MacBook Pro repair is ready for pickup
                  </p>
                  <p className="text-xs text-gray-400">2 minutes ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Low Stock Alert</p>
                  <p className="text-xs text-gray-500">
                    Dell XPS 13 stock is running low (2 units left)
                  </p>
                  <p className="text-xs text-gray-400">1 hour ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">New Sale</p>
                  <p className="text-xs text-gray-500">
                    ₹1,87,371 sale completed at South store
                  </p>
                  <p className="text-xs text-gray-400">3 hours ago</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Store Settings</DropdownMenuItem>
              <DropdownMenuItem>User Management</DropdownMenuItem>
              <DropdownMenuItem>Backup Data</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
