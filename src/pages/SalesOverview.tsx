import React from "react";
import { Link } from "react-router-dom";

export default function SalesOverview() {
  // Mock sales data
  const salesStats = {
    todaySales: 12,
    todayRevenue: 480000,
    monthSales: 328,
    monthRevenue: 1320000,
    pendingOrders: 5,
    lowStockItems: 8,
  };

  const recentSales = [
    {
      id: "1",
      customer: "John Doe",
      product: "Dell Inspiron 15",
      amount: 42000,
      time: "2 hours ago",
      status: "completed",
    },
    {
      id: "2",
      customer: "Jane Smith",
      product: "HP Pavilion Gaming",
      amount: 65000,
      time: "4 hours ago",
      status: "completed",
    },
    {
      id: "3",
      customer: "Mike Johnson",
      product: "MacBook Air M2",
      amount: 115000,
      time: "6 hours ago",
      status: "pending",
    },
  ];

  const quickActions = [
    {
      title: "New Sale",
      description: "Create a new sales transaction",
      link: "/sales/new",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      textColor: "text-blue-900",
      icon: "💰",
    },
    {
      title: "Inventory Management",
      description: "View and manage product inventory",
      link: "/sales/inventory",
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      textColor: "text-green-900",
      icon: "📦",
    },
    {
      title: "Customer Search",
      description: "Find and manage customers",
      link: "/sales/customers",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      textColor: "text-purple-900",
      icon: "👥",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sales Overview</h1>
        <p className="text-gray-600">
          Manage sales transactions, inventory, and customer interactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Today's Sales</h3>
          <p className="text-2xl font-bold text-blue-600">
            {salesStats.todaySales}
          </p>
          <p className="text-sm text-gray-500">transactions</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Today's Revenue</h3>
          <p className="text-2xl font-bold text-green-600">
            ₹{(salesStats.todayRevenue / 1000).toFixed(0)}K
          </p>
          <p className="text-sm text-gray-500">earned today</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Monthly Sales</h3>
          <p className="text-2xl font-bold text-blue-600">
            {salesStats.monthSales}
          </p>
          <p className="text-sm text-green-600">↑ 12% vs last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
          <p className="text-2xl font-bold text-green-600">
            ₹{(salesStats.monthRevenue / 100000).toFixed(1)}L
          </p>
          <p className="text-sm text-green-600">↑ 8% vs last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
          <p className="text-2xl font-bold text-orange-600">
            {salesStats.pendingOrders}
          </p>
          <p className="text-sm text-gray-500">need attention</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Low Stock</h3>
          <p className="text-2xl font-bold text-red-600">
            {salesStats.lowStockItems}
          </p>
          <p className="text-sm text-gray-500">items running low</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`p-6 rounded-lg border-2 transition-colors ${action.color}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{action.icon}</div>
                <div>
                  <h3 className={`font-semibold ${action.textColor}`}>
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent Sales</h2>
          <Link
            to="/sales/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            New Sale
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sale.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{sale.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        sale.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">
            Sales Performance
          </h3>
          <p className="text-blue-800 text-sm mb-3">
            Today's performance compared to yesterday
          </p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-blue-700">Transactions:</span>
              <span className="text-blue-900 font-semibold">+15%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Revenue:</span>
              <span className="text-blue-900 font-semibold">+22%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Avg. Order:</span>
              <span className="text-blue-900 font-semibold">+8%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">
            Top Performing Products
          </h3>
          <p className="text-green-800 text-sm mb-3">
            Best selling items this month
          </p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-green-700">MacBook Air M2:</span>
              <span className="text-green-900 font-semibold">23 sold</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">HP Pavilion Gaming:</span>
              <span className="text-green-900 font-semibold">19 sold</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Dell Inspiron 15:</span>
              <span className="text-green-900 font-semibold">17 sold</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-900">
          ✅ Sales Overview Working!
        </h3>
        <p className="text-green-800">
          This is your main sales dashboard with key metrics and quick actions.
        </p>
        <p className="text-sm text-green-700 mt-1">
          Navigate to specific sales functions using the quick action cards
          above.
        </p>
      </div>
    </div>
  );
}
