import React, { useState, useEffect } from 'react';
import { FiPlus, FiFilter, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import InventoryActions from '../components/InventoryActions';
import inventoryService, { InventoryItem } from '../services/inventoryService';

const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    search: string;
    category: string;
    store: string;
    lowStock: boolean;
  }>({
    search: '',
    category: '',
    store: '',
    lowStock: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.getInventory({
        ...filters,
        lowStock: filters.lowStock ? 'true' : undefined,
      });
      setInventory(data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setError('Failed to load inventory. Please try again.');
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchInventory();
  }, [filters]);

  // These handlers are now handled by the InventoryActions component directly
  // Keeping them here for future use if needed

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type } = e.target;
    const value = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;
    
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      store: '',
      lowStock: false,
    });
    // Trigger a refetch after a short delay to ensure state is updated
    setTimeout(() => {
      fetchInventory();
    }, 100);
  };

  // Get unique categories and stores for filter dropdowns
  const categories = [...new Set(inventory.map(item => item.category))];
  const stores = [...new Set(inventory.map(item => item.store))];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-gray-600">Manage your inventory items and stock levels</p>
        </div>
        <button
          onClick={() => {}}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          <FiPlus /> Add New Item
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              placeholder="Search items..."
              value={filters.search}
              onChange={handleFilterChange}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FiFilter />
            <span>Filters</span>
          </button>
          <button
            onClick={fetchInventory}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            title="Refresh"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
              <select
                name="store"
                value={filters.store}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">All Stores</option>
                {stores.map(store => (
                  <option key={store} value={store}>
                    {store}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="lowStock"
                  checked={filters.lowStock}
                  onChange={handleFilterChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show low stock only</span>
              </label>
              <button
                onClick={resetFilters}
                className="ml-auto text-sm text-blue-600 hover:text-blue-800"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : inventory.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No inventory items found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item._id} className={item.isLowStock ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      {item.sku && (
                        <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.brand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.store}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.stock}
                        {item.isLowStock && (
                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            Low Stock
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Threshold: {item.lowStockThreshold}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{item.price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <InventoryActions
                        item={item}
                        onUpdate={fetchInventory}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
