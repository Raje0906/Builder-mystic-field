import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CustomerSearch } from "@/components/customers/CustomerSearch";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  User,
  Package,
  CreditCard,
  Calculator,
  Trash2,
  Plus,
} from "lucide-react";
import { Customer, Product, Sale } from "@/types";
import { getProducts, addSale } from "@/lib/dataUtils";
import { stores, employees } from "@/lib/mockData";

interface SaleItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export function NewSale() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "upi" | "emi"
  >("cash");
  const [taxRate] = useState<number>(18); // GST 18%
  const [showCustomerSearch, setShowCustomerSearch] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const loadedProducts = await getProducts();
        setProducts(loadedProducts.filter((p) => p.stock > 0));
      } catch (error) {
        console.error('Error loading products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products',
          variant: 'destructive',
        });
      }
    };

    loadProducts();
  }, []);

  const addItemToSale = () => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive",
      });
      return;
    }

    if (quantity > product.stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stock} units available`,
        variant: "destructive",
      });
      return;
    }

    const unitPrice = customPrice ? parseFloat(customPrice) : product.price;
    const newItem: SaleItem = {
      product,
      quantity,
      unitPrice,
      discount: 0,
    };

    setSaleItems([...saleItems, newItem]);
    setSelectedProductId("");
    setQuantity(1);
    setCustomPrice("");
  };

  const removeItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const updateItemDiscount = (index: number, discount: number) => {
    const updated = [...saleItems];
    updated[index].discount = discount;
    setSaleItems(updated);
  };

  const calculateTotals = () => {
    const subtotal = saleItems.reduce((sum, item) => {
      return sum + item.unitPrice * item.quantity;
    }, 0);

    const totalDiscount =
      saleItems.reduce((sum, item) => {
        return sum + item.discount;
      }, 0) + discount;

    const discountedAmount = subtotal - totalDiscount;
    const tax = (discountedAmount * taxRate) / 100;
    const finalAmount = discountedAmount + tax;

    return {
      subtotal,
      totalDiscount,
      discountedAmount,
      tax,
      finalAmount,
    };
  };

  const processSale = async () => {
    if (!selectedCustomer) {
      toast({
        title: "Customer Required",
        description: "Please select a customer for this sale",
        variant: "destructive",
      });
      return;
    }

    if (saleItems.length === 0) {
      toast({
        title: "No Items",
        description: "Please add at least one item to the sale",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const totals = calculateTotals();

      // For this demo, we'll create a sale with the first item
      // In a real app, you'd handle multiple items properly
      const firstItem = saleItems[0];

      const newSale = addSale({
        customerId: selectedCustomer.id,
        productId: firstItem.product.id,
        quantity: firstItem.quantity,
        unitPrice: firstItem.unitPrice,
        totalAmount: totals.subtotal,
        discount: totals.totalDiscount,
        tax: totals.tax,
        finalAmount: totals.finalAmount,
        paymentMethod,
        storeId: "store-1", // Default to first store
        salesPersonId: employees.find((e) => e.role === "sales")?.id || "emp-1",
        status: "completed",
        warranty: {
          duration: 12,
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        },
      });

      toast({
        title: "Sale Completed Successfully",
        description: `Sale ID: ${newSale.id} | Amount: ₹${newSale.finalAmount.toLocaleString()}`,
      });

      // Reset form
      setSelectedCustomer(null);
      setSaleItems([]);
      setShowCustomerSearch(true);
      setDiscount(0);
      setPaymentMethod("cash");
    } catch (error) {
      toast({
        title: "Error Processing Sale",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const totals = calculateTotals();

  if (showCustomerSearch) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Sale</h1>
          <p className="text-gray-600 mt-2">
            Select customer to begin sale process
          </p>
        </div>

        <CustomerSearch
          onCustomerSelect={(customer) => {
            setSelectedCustomer(customer);
            setShowCustomerSearch(false);
          }}
          showAddCustomer={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Sale</h1>
          <p className="text-gray-600 mt-2">Create a new sale transaction</p>
        </div>
        <Button variant="outline" onClick={() => setShowCustomerSearch(true)}>
          <User className="w-4 h-4 mr-2" />
          Change Customer
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Sale Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCustomer && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">{selectedCustomer.name}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedCustomer.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedCustomer.phone}
                    </p>
                  </div>
                  <Badge variant="default">{selectedCustomer.status}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Add Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
                  <Label>Product</Label>
                  <Select
                    value={selectedProductId}
                    onValueChange={setSelectedProductId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ₹{product.price.toLocaleString()} (
                          {product.stock} in stock)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div>
                  <Label>Custom Price (Optional)</Label>
                  <Input
                    type="number"
                    placeholder="Override price"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={addItemToSale} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add to Sale
              </Button>
            </CardContent>
          </Card>

          {/* Sale Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Sale Items ({saleItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {saleItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No items added to sale yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {saleItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">
                          ₹{item.unitPrice.toLocaleString()} × {item.quantity} =
                          ₹{(item.unitPrice * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Discount"
                          value={item.discount}
                          onChange={(e) =>
                            updateItemDiscount(
                              index,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-24"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sale Summary */}
        <div className="space-y-6">
          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={paymentMethod}
                onValueChange={(value: any) => setPaymentMethod(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="emi">EMI</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Bill Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Bill Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{totals.subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <Label htmlFor="additional-discount">
                  Additional Discount:
                </Label>
                <Input
                  id="additional-discount"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-24 text-right"
                />
              </div>

              <div className="flex justify-between text-green-600">
                <span>Total Discount:</span>
                <span>-₹{totals.totalDiscount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span>After Discount:</span>
                <span>₹{totals.discountedAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span>GST ({taxRate}%):</span>
                <span>₹{totals.tax.toLocaleString()}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span>₹{totals.finalAmount.toLocaleString()}</span>
              </div>

              <Button
                onClick={processSale}
                disabled={
                  isProcessing || saleItems.length === 0 || !selectedCustomer
                }
                className="w-full mt-4"
                size="lg"
              >
                {isProcessing ? "Processing..." : "Complete Sale"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
