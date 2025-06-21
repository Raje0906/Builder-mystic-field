import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  ShoppingCart,
  Wrench,
  Store,
  TrendingUp,
  Calendar,
  Users,
  Package,
} from "lucide-react";

export function ReportsOverview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Access comprehensive analytics and insights for your business
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Reports
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Report categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Periods</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Monthly</div>
            <p className="text-xs text-muted-foreground">Quarterly & Annual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Store locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Export Options
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">JSON</div>
            <p className="text-xs text-muted-foreground">Data export</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Categories */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              Sales Reports
            </CardTitle>
            <CardDescription>
              Analyze sales performance, revenue trends, and product analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Key Metrics:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Total revenue and transactions</li>
                <li>• Top-selling products</li>
                <li>• Store performance comparison</li>
                <li>• Average order value trends</li>
              </ul>
            </div>
            <Button asChild className="w-full">
              <Link to="/reports/sales">View Sales Reports</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wrench className="w-6 h-6 text-green-600" />
              </div>
              Repair Reports
            </CardTitle>
            <CardDescription>
              Monitor repair services, completion rates, and customer
              satisfaction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Key Metrics:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Repair completion rates</li>
                <li>• Average turnaround time</li>
                <li>• Common repair issues</li>
                <li>• Service revenue analysis</li>
              </ul>
            </div>
            <Button asChild className="w-full">
              <Link to="/reports/repairs">View Repair Reports</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Store className="w-6 h-6 text-orange-600" />
              </div>
              Store Reports
            </CardTitle>
            <CardDescription>
              Compare performance across all store locations and teams
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Key Metrics:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Multi-store revenue comparison</li>
                <li>• Staff performance metrics</li>
                <li>• Inventory distribution</li>
                <li>• Regional market analysis</li>
              </ul>
            </div>
            <Button asChild className="w-full">
              <Link to="/reports/stores">View Store Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Report Features */}
      <Card>
        <CardHeader>
          <CardTitle>Report Features</CardTitle>
          <CardDescription>
            Powerful analytics tools at your fingertips
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-900">
                  Flexible Time Periods
                </h4>
                <p className="text-sm text-blue-700">
                  Monthly, quarterly, and annual reporting options
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h4 className="font-semibold text-green-900">
                  Visual Analytics
                </h4>
                <p className="text-sm text-green-700">
                  Interactive charts and graphs for better insights
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h4 className="font-semibold text-purple-900">
                  Multi-Store Data
                </h4>
                <p className="text-sm text-purple-700">
                  Compare performance across all store locations
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
              <Package className="w-6 h-6 text-orange-600 mt-1" />
              <div>
                <h4 className="font-semibold text-orange-900">Export Data</h4>
                <p className="text-sm text-orange-700">
                  Download reports for external analysis and sharing
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Generate reports and access frequently used analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button asChild variant="outline" size="lg">
              <Link to="/reports/sales" className="h-auto py-4">
                <div className="text-center">
                  <ShoppingCart className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">This Month's Sales</div>
                  <div className="text-xs text-gray-500">
                    Current month performance
                  </div>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link to="/reports/repairs" className="h-auto py-4">
                <div className="text-center">
                  <Wrench className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Service Analytics</div>
                  <div className="text-xs text-gray-500">
                    Repair performance metrics
                  </div>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link to="/reports/stores" className="h-auto py-4">
                <div className="text-center">
                  <Store className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Store Comparison</div>
                  <div className="text-xs text-gray-500">
                    Multi-location analysis
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
