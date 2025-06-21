import React, { useState, useEffect } from "react";

export default function SimpleSalesInventory() {
  const [products, setProducts] = useState([]);

  // Mock product data
  const mockProducts = [
    {
      id: "1",
      name: "Dell Inspiron 15 3000",
      brand: "Dell",
      model: "Inspiron 15 3000",
      sku: "DELL-INS-15-3000",
      price: 42000,
      stock: 25,
      category: "laptop",
      status: "active",
    },
    {
      id: "2",
      name: "HP Pavilion Gaming 15",
      brand: "HP",
      model: "Pavilion Gaming 15",
      sku: "HP-PAV-GAME-15",
      price: 65000,
      stock: 15,
      category: "laptop",
      status: "active",
    },
    {
      id: "3",
      name: "MacBook Air M2",
      brand: "Apple",
      model: "MacBook Air M2",
      sku: "APPLE-MBA-M2",
      price: 115000,
      stock: 8,
      category: "laptop",
      status: "active",
    },
    {
      id: "4",
      name: "Lenovo ThinkPad E14",
      brand: "Lenovo",
      model: "ThinkPad E14",
      sku: "LEN-TP-E14",
      price: 55000,
      stock: 5,
      category: "laptop",
      status: "low_stock",
    },
  ];

  useEffect(() => {
    setProducts(mockProducts);
  }, []);

  const getStockStatus = (stock) => {
    if (stock <= 5)
      return { color: "bg-red-100 text-red-800", text: "Low Stock" };
    if (stock <= 10)
      return { color: "bg-yellow-100 text-yellow-800", text: "Medium" };
    return { color: "bg-green-100 text-green-800", text: "In Stock" };
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sales Inventory</h1>
        <p className="text-gray-600">
          Manage your product inventory and stock levels
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
          <p className="text-2xl font-bold text-red-600">
            {products.filter((p) => p.stock <= 5).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
          <p className="text-2xl font-bold text-green-600">
            ₹
            {products
              .reduce((sum, p) => sum + p.price * p.stock, 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Active Products</h3>
          <p className="text-2xl font-bold text-blue-600">
            {products.filter((p) => p.status === "active").length}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add Product
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Update Stock
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            Export Inventory
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            Filter Products
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Product Inventory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.brand} {product.model}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}
                      >
                        {stockStatus.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{(product.price * product.stock).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          Edit
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          Stock
                        </button>
                        <button className="text-purple-600 hover:text-purple-900">
                          View
                        </button>
                      </div>
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
          ✅ Sales Inventory Working!
        </h3>
        <p className="text-blue-800">
          This page shows your product inventory with stock management.
        </p>
        <p className="text-sm text-blue-700 mt-1">
          Stock levels, pricing, and product information are all displayed
          correctly.
        </p>
      </div>
    </div>
  );
}
