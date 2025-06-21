import React, { useState, useEffect } from "react";

export default function SimpleInventoryOverview() {
  const [products, setProducts] = useState([]);

  // Mock inventory data
  const mockProducts = [
    {
      id: "1",
      name: "Dell Inspiron 15 3000",
      brand: "Dell",
      category: "laptop",
      stock: 25,
      price: 42000,
      lowStockThreshold: 10,
      store: "Central",
    },
    {
      id: "2",
      name: "HP Pavilion Gaming 15",
      brand: "HP",
      category: "laptop",
      stock: 15,
      price: 65000,
      lowStockThreshold: 10,
      store: "North",
    },
    {
      id: "3",
      name: "MacBook Air M2",
      brand: "Apple",
      category: "laptop",
      stock: 8,
      price: 115000,
      lowStockThreshold: 5,
      store: "South",
    },
    {
      id: "4",
      name: "Lenovo ThinkPad E14",
      brand: "Lenovo",
      category: "laptop",
      stock: 3,
      price: 55000,
      lowStockThreshold: 5,
      store: "Central",
    },
    {
      id: "5",
      name: "ASUS ROG Strix G15",
      brand: "ASUS",
      category: "laptop",
      stock: 12,
      price: 85000,
      lowStockThreshold: 8,
      store: "North",
    },
  ];

  useEffect(() => {
    setProducts(mockProducts);
  }, []);

  // Calculate stats
  const totalProducts = products.length;
  const lowStockItems = products.filter(
    (p) => p.stock <= p.lowStockThreshold,
  ).length;
  const totalValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);
  const outOfStock = products.filter((p) => p.stock === 0).length;

  // Category breakdown
  const categories = {};
  products.forEach((p) => {
    categories[p.category] = (categories[p.category] || 0) + 1;
  });

  // Store breakdown
  const stores = {};
  products.forEach((p) => {
    stores[p.store] = (stores[p.store] || 0) + p.stock;
  });

  const getStockStatus = (product) => {
    if (product.stock === 0)
      return { color: "bg-red-500", text: "Out of Stock" };
    if (product.stock <= product.lowStockThreshold)
      return { color: "bg-yellow-500", text: "Low Stock" };
    return { color: "bg-green-500", text: "In Stock" };
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Overview</h1>
        <p className="text-gray-600">
          Monitor stock levels and inventory performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
          <p className="text-sm text-gray-500">SKUs in system</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
          <p className="text-2xl font-bold text-red-600">{lowStockItems}</p>
          <p className="text-sm text-gray-500">Need attention</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Inventory Value</h3>
          <p className="text-2xl font-bold text-green-600">
            ₹{(totalValue / 100000).toFixed(1)}L
          </p>
          <p className="text-sm text-gray-500">Total stock value</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Out of Stock</h3>
          <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
          <p className="text-sm text-gray-500">Items unavailable</p>
        </div>
      </div>

      {/* Category & Store Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Category Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(categories).map(([category, count], index) => (
              <div key={category} className="flex items-center justify-between">
                <span className="capitalize font-medium">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / totalProducts) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Store Stock Levels */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Stock by Store</h2>
          <div className="space-y-3">
            {Object.entries(stores).map(([store, stock], index) => (
              <div key={store} className="flex items-center justify-between">
                <span className="font-medium">{store} Store</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((stock / 100) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{stock} units</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems > 0 && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">
            ⚠️ Low Stock Alerts
          </h3>
          <p className="text-yellow-800 mb-3">
            {lowStockItems} items need restocking
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {products
              .filter((p) => p.stock <= p.lowStockThreshold)
              .map((product) => (
                <div
                  key={product.id}
                  className="p-3 bg-white rounded border border-yellow-300"
                >
                  <div className="font-medium text-gray-900">
                    {product.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {product.store} Store
                  </div>
                  <div className="text-sm text-red-600">
                    Only {product.stock} units left (threshold:{" "}
                    {product.lowStockThreshold})
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">All Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const status = getStockStatus(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.brand}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.store}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${status.color}`}
                        ></div>
                        <span className="text-sm text-gray-600">
                          {status.text}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{(product.stock * product.price).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900">
          ✅ Inventory Overview Working!
        </h3>
        <p className="text-blue-800">
          This page shows comprehensive inventory management without chart
          warnings.
        </p>
        <p className="text-sm text-blue-700 mt-1">
          Stock levels, alerts, and product information are displayed clearly.
        </p>
      </div>
    </div>
  );
}
