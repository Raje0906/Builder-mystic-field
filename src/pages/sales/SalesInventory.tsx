import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Package,
  AlertTriangle,
  Eye,
  TrendingDown,
  TrendingUp,
  ShoppingCart,
  Laptop,
} from "lucide-react";
import { getProducts } from "@/lib/dataUtils";
import { stores } from "@/lib/mockData";
import { Product } from "@/types";

export function SalesInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const updateStock = async (productId: string, newQuantity: number) => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const response = await fetch(`/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update stock');
      }

      const { data: updatedProduct } = await response.json();
      
      // Update local state
      const updatedProducts = products.map(p => 
        p.id === updatedProduct._id 
          ? { ...p, stock: updatedProduct.stock_quantity } 
          : p
      );
      
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      setIsStockDialogOpen(false);
      
      return updatedProduct;
    } catch (err) {
      console.error('Error updating stock:', err);
      setError(err instanceof Error ? err.message : 'Failed to update stock');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const allProducts = getProducts();
    setProducts(allProducts);
    setFilteredProducts(allProducts);
  }, []);

  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.serialNumber
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          product.barcode.includes(searchQuery),
      );
    }

    // Store filter
    if (selectedStore !== "all") {
      filtered = filtered.filter(
        (product) => product.storeId === selectedStore,
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory,
      );
    }

    // Stock filter
    switch (stockFilter) {
      case "in-stock":
        filtered = filtered.filter(
          (product) => product.stock > product.minStock,
        );
        break;
      case "low-stock":
        filtered = filtered.filter(
          (product) => product.stock <= product.minStock && product.stock > 0,
        );
        break;
      case "out-of-stock":
        filtered = filtered.filter((product) => product.stock === 0);
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedStore, selectedCategory, stockFilter]);

  const getStockStatus = (product: Product) => {
    if (product.stock === 0)
      return { label: "Out of Stock", variant: "destructive" as const };
    if (product.stock <= product.minStock)
      return { label: "Low Stock", variant: "outline" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  const getStoreName = (storeId: string) => {
    return (
      stores.find((store) => store.id === storeId)?.name || "Unknown Store"
    );
  };

  const categories = [...new Set(products.map((p) => p.category))];
  const totalValue = filteredProducts.reduce(
    (sum, product) => sum + product.price * product.stock,
    0,
  );
  const lowStockCount = products.filter(
    (p) => p.stock <= p.minStock && p.stock > 0,
  ).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              of {products.length} total items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inventory Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(totalValue / 100000).toFixed(1)}L
            </div>
            <p className="text-xs text-muted-foreground">Total stock value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {outOfStockCount}
            </div>
            <p className="text-xs text-muted-foreground">Unavailable items</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger>
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedStore("all");
                setSelectedCategory("all");
                setStockFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            Showing {filteredProducts.length} of {products.length} products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Laptop className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">
                            {product.brand} {product.model}
                          </p>
                          <p className="text-xs text-gray-400">
                            S/N: {product.serialNumber}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {getStoreName(product.storeId)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{product.stock}</span>
                        <span className="text-xs text-gray-500">
                          Min: {product.minStock}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        ₹{product.price.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.variant}>
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedProduct(product)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Product Details</DialogTitle>
                              <DialogDescription>
                                Complete information about {product.name}
                              </DialogDescription>
                            </DialogHeader>

                            {selectedProduct && (
                              <div className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Basic Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <strong>Name:</strong>{" "}
                                        {selectedProduct.name}
                                      </div>
                                      <div>
                                        <strong>Brand:</strong>{" "}
                                        {selectedProduct.brand}
                                      </div>
                                      <div>
                                        <strong>Model:</strong>{" "}
                                        {selectedProduct.model}
                                      </div>
                                      <div>
                                        <strong>Category:</strong>{" "}
                                        {selectedProduct.category}
                                      </div>
                                      <div>
                                        <strong>Serial Number:</strong>{" "}
                                        {selectedProduct.serialNumber}
                                      </div>
                                      <div>
                                        <strong>Barcode:</strong>{" "}
                                        {selectedProduct.barcode}
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Pricing & Stock
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <strong>Price:</strong> ₹
                                        {selectedProduct.price.toLocaleString()}
                                      </div>
                                      <div>
                                        <strong>Cost:</strong> ₹
                                        {selectedProduct.cost.toLocaleString()}
                                      </div>
                                      <div>
                                        <strong>Current Stock:</strong>{" "}
                                        {selectedProduct.stock}
                                      </div>
                                      <div>
                                        <strong>Minimum Stock:</strong>{" "}
                                        {selectedProduct.minStock}
                                      </div>
                                      <div>
                                        <strong>Store:</strong>{" "}
                                        {getStoreName(selectedProduct.storeId)}
                                      </div>
                                      <div>
                                        <strong>Status:</strong>
                                        <Badge
                                          className="ml-2"
                                          variant={
                                            getStockStatus(selectedProduct)
                                              .variant
                                          }
                                        >
                                          {
                                            getStockStatus(selectedProduct)
                                              .label
                                          }
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Specifications
                                  </h4>
                                  <div className="grid gap-2 md:grid-cols-2 text-sm">
                                    {Object.entries(
                                      selectedProduct.specifications,
                                    ).map(([key, value]) => (
                                      <div key={key}>
                                        <strong>{key}:</strong> {value}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setStockQuantity(product.stock);
                            setIsStockDialogOpen(true);
                          }}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/sales/products/edit/${product.id}`)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                            <path d="m15 5 4 4"/>
                          </svg>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Management Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setError(null);
          setIsStockDialogOpen(false);
        } else {
          setIsStockDialogOpen(true);
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Stock Level</DialogTitle>
            <DialogDescription>
              Update the stock quantity for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="stock" className="text-right">
                Quantity
              </label>
              <div className="col-span-3 space-y-2">
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  disabled={isUpdating}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Current: {selectedProduct?.stock || 0}
                </p>
              </div>
            </div>
            {error && (
              <div className="mt-2 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setError(null);
                setIsStockDialogOpen(false);
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              onClick={async () => {
                if (selectedProduct) {
                  try {
                    await updateStock(selectedProduct.id, stockQuantity);
                  } catch (err) {
                    // Error is already handled in updateStock
                  }
                }
              }}
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Stock'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
