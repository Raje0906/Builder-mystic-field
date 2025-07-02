import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SimpleSalesInventory() {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line
  }, [date]);

  const fetchSales = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/sales?startDate=${date}&endDate=${date}`
      );
      const data = await res.json();
      if (data.success) {
        setSales(data.data.sales || []);
      } else {
        setError(data.message || "Failed to fetch sales");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Sales Report</h1>
          <p className="text-gray-600">View all sales made on a specific day</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="date" className="font-medium text-gray-700">Select Date:</label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-40"
          />
          <Button onClick={fetchSales} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Sales for {date}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">No sales found for this date.</td>
                </tr>
              )}
              {sales.map((sale) => (
                <tr key={sale._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sale.customer?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.items && sale.items[0]?.product?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{sale.totalAmount?.toLocaleString?.() || sale.totalAmount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.createdAt ? new Date(sale.createdAt).toLocaleTimeString() : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${sale.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
