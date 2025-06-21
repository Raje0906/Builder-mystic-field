import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter, FiRefreshCw, FiEdit2, FiTrash2, FiEye, FiPlusCircle, FiDownload } from 'react-icons/fi'; // Added FiDownload
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import inventoryService, { InventoryItem } from '@/services/inventoryService';

const InventoryPage = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
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
      console.log('Fetching inventory with params:', {
        search: searchTerm,
        activeOnly: true,
        ...filters,
      });
      
      const data = await inventoryService.getInventory({
        search: searchTerm,
        activeOnly: true, // Only fetch active items
        ...filters,
      });
      
      console.log('Received inventory data:', data);
      setInventory(data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory. Please try again.');
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const location = useLocation();
  
  // Initial data fetch and refresh when needed
  useEffect(() => {
    // Force a refresh when coming from the form
    const shouldRefresh = location.state?.refresh || false;
    if (shouldRefresh) {
      // Clear the state to prevent unnecessary refreshes
      window.history.replaceState({}, document.title);
      // Small delay to ensure state is cleared before refresh
      setTimeout(() => {
        fetchInventory();
      }, 100);
    } else {
      fetchInventory();
    }
  }, [searchTerm, filters, location.state]);

  // Handle delete item
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryService.deleteInventoryItem(id);
        toast.success('Item deleted successfully');
        fetchInventory();
      } catch (err) {
        console.error('Error deleting item:', err);
        toast.error('Failed to delete item');
      }
    }
  };

  // Get unique categories and stores for filters
  const categories = [...new Set(inventory.map(item => item.category))];
  const stores = [...new Set(inventory.map(item => item.store))];

  // Get stock status
  const getStockStatus = (item: InventoryItem) => {
    if (item.stock === 0) return { text: 'Out of Stock', variant: 'destructive' };
    if (item.stock <= item.lowStockThreshold) return { text: 'Low Stock', variant: 'warning' };
    return { text: 'In Stock', variant: 'success' };
  };

  // Export inventory to CSV
  const exportToCSV = () => {
    if (inventory.length === 0) {
      toast.info('No data to export');
      return;
    }

    try {
      // Define CSV headers
      const headers = [
        'Name',
        'SKU',
        'Brand',
        'Category',
        'Store',
        'Stock',
        'Status',
        'Price',
        'Low Stock Threshold'
      ];

      // Convert inventory data to CSV rows
      const csvRows = [
        headers.join(','),
        ...inventory.map(item => {
          const status = getStockStatus(item);
          return [
            `"${item.name?.replace(/"/g, '""') || ''}"`,
            `"${item.sku || ''}"`,
            `"${item.brand || ''}"`,
            `"${item.category || ''}"`,
            `"${item.store || ''}"`,
            item.stock,
            `"${status.text}"`,
            item.price,
            item.lowStockThreshold
          ].join(',');
        })
      ];

      // Create CSV content
      const csvContent = csvRows.join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      link.href = url;
      link.setAttribute('download', `inventory-export-${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your inventory items and stock levels
          </p>
        </div>
        <Button onClick={() => navigate('/inventory/new')}>
          <FiPlus className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <FiFilter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            <Button
              variant="outline"
              onClick={fetchInventory}
              disabled={loading}
              className="gap-2"
            >
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Store</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={filters.store}
                  onChange={(e) => setFilters({ ...filters, store: e.target.value })}
                >
                  <option value="">All Stores</option>
                  {stores.map((store) => (
                    <option key={store} value={store}>
                      {store}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="lowStock"
                    checked={filters.lowStock}
                    onChange={(e) => setFilters({ ...filters, lowStock: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="lowStock" className="text-sm font-medium">
                    Low Stock Only
                  </label>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({ category: '', store: '', lowStock: false })}
                  className="ml-auto"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>
                {inventory.length} item{inventory.length !== 1 ? 's' : ''} in stock
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={exportToCSV}
                disabled={loading || inventory.length === 0}
              >
                <FiDownload className="mr-2 h-3.5 w-3.5" />
                <span>Export</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-destructive">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : inventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  inventory.map((item) => {
                    const status = getStockStatus(item);
                    return (
                      <TableRow key={item._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-md bg-muted mr-3"></div>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">
                                SKU: {item.sku || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.brand}</TableCell>
                        <TableCell>{item.store}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span>{item.stock}</span>
                            <Badge variant={status.variant as any}>
                              {status.text}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(item.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/inventory/${item._id}`)}
                              title="View"
                            >
                              <FiEye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/inventory/${item._id}/edit`)}
                              title="Edit"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item._id)}
                              title="Delete"
                              className="text-destructive hover:text-destructive/90"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/inventory/${item._id}/stock`)}
                              title="Add Stock"
                              className="text-green-600 hover:text-green-700"
                            >
                              <FiPlusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryPage;
