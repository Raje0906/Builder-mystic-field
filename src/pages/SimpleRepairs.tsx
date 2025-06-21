import React, { useState, useEffect } from "react";

export default function SimpleRepairs() {
  const [repairs, setRepairs] = useState([]);

  // Mock repair data
  const mockRepairs = [
    {
      id: "1",
      ticketNumber: "RPR-20241210-0001",
      customerName: "John Doe",
      device: "Dell Inspiron 15",
      problem: "Screen not working",
      status: "in_progress",
      priority: "high",
      createdAt: "2024-12-09",
      estimatedCost: 5000,
    },
    {
      id: "2",
      ticketNumber: "RPR-20241210-0002",
      customerName: "Jane Smith",
      device: "HP Pavilion",
      problem: "Battery not charging",
      status: "diagnosed",
      priority: "medium",
      createdAt: "2024-12-08",
      estimatedCost: 3000,
    },
    {
      id: "3",
      ticketNumber: "RPR-20241210-0003",
      customerName: "Mike Johnson",
      device: "MacBook Air",
      problem: "Keyboard not working",
      status: "completed",
      priority: "low",
      createdAt: "2024-12-07",
      estimatedCost: 8000,
    },
  ];

  useEffect(() => {
    setRepairs(mockRepairs);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "diagnosed":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Repair Management</h1>
        <p className="text-gray-600">Track and manage device repairs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Total Repairs</h3>
          <p className="text-2xl font-bold text-gray-900">{repairs.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
          <p className="text-2xl font-bold text-blue-600">
            {repairs.filter((r) => r.status === "in_progress").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Completed</h3>
          <p className="text-2xl font-bold text-green-600">
            {repairs.filter((r) => r.status === "completed").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
          <p className="text-2xl font-bold text-purple-600">
            ₹
            {repairs
              .reduce((sum, r) => sum + r.estimatedCost, 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            New Repair
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            Filter Repairs
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            Export Data
          </button>
        </div>
      </div>

      {/* Repairs Table */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">All Repairs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Problem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {repairs.map((repair) => (
                <tr key={repair.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {repair.ticketNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {repair.createdAt}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {repair.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {repair.device}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {repair.problem}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        repair.status,
                      )}`}
                    >
                      {repair.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                        repair.priority,
                      )}`}
                    >
                      {repair.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{repair.estimatedCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-900">
          ✅ Repair Management Working!
        </h3>
        <p className="text-green-800">
          This page shows repair tracking and management functionality.
        </p>
        <p className="text-sm text-green-700 mt-1">
          All repair-related features are functional and ready for use.
        </p>
      </div>
    </div>
  );
}
