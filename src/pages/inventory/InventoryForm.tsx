import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import inventoryService, { InventoryItem } from '@/services/inventoryService';
import { useZxing } from 'react-zxing';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(1, 'Brand is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be a positive number'),
  stock: z.number().min(0, 'Stock must be a positive number'),
  lowStockThreshold: z.number().min(0, 'Threshold must be a positive number'),
  store: z.string().min(1, 'Store is required'),
  sku: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const InventoryForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      brand: '',
      category: '',
      description: '',
      price: 0,
      stock: 0,
      lowStockThreshold: 5,
      store: '',
      sku: '',
    },
  });

  const [products, setProducts] = useState<any[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const skuInputRef = useState(null);
  const videoRef = useState(null);
  const [cameraTimeoutId, setCameraTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // ZXing barcode scanner hook
  const { ref: zxingRef } = useZxing({
    onResult(result) {
      form.setValue('serialNumber', result.getText());
      setShowScanner(false);
      setScanError(null);
      setCameraError(null);
      setCameraLoading(false);
      toast.success(`Scanned: ${result.getText()}`);
    },
    onError(error) {
      setScanError('Scan error. Please try again.');
      setCameraLoading(false);
      if (error && error.name === 'NotAllowedError') {
        setCameraError('Camera access was denied. Please allow camera access in your browser settings and refresh the page.');
      } else if (error && error.name === 'NotFoundError') {
        setCameraError('No camera device found. Please connect a camera and try again.');
      } else if (error && error.name === 'NotReadableError') {
        setCameraError('Camera is already in use by another application. Please close other apps and try again.');
      } else if (error && error.name === 'NotSupportedError') {
        setCameraError('Camera access is not supported in this browser. Please use Chrome or Firefox.');
      } else {
        setCameraError(null);
      }
    },
  });

  // Load item data if in edit mode
  useEffect(() => {
    const loadItem = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const item = await inventoryService.getInventoryItem(id);
        if (item) {
          form.reset({
            ...item,
            // Ensure numeric fields are numbers
            price: Number(item.price),
            stock: Number(item.stock),
            lowStockThreshold: Number(item.lowStockThreshold),
          });
        }
      } catch (error) {
        console.error('Error loading item:', error);
        toast.error('Failed to load item data');
        navigate('/inventory');
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [id, form, navigate]);
  
  const location = useLocation();
  
  useEffect(() => {
    // Load products for the dropdown
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(Array.isArray(data.data?.products) ? data.data.products : []);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    loadProducts();
  }, []);
  
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      
      if (isEditMode && id) {
        await inventoryService.updateInventoryItem(id, values);
        toast.success('Item updated successfully');
      } else {
        await inventoryService.createInventoryItem(values);
        toast.success('Item created successfully');
        
        // Force a full page reload to ensure the inventory list is refreshed
        // This is a workaround for any potential state management issues
        window.location.href = '/inventory';
        return; // Prevent navigation code below from running
      }
      
      // Only navigate if not creating a new item (edit case)
      navigate('/inventory', { 
        replace: true,
        state: { refresh: true } 
      });
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} item`);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Laptop', 'Desktop', 'Tablet', 'Smartphone', 'Accessory', 'Component', 'Other'
  ];

  const stores = [
    'Central', 'North', 'South', 'East', 'West'
  ];

  // Focus SKU input for hardware scanner
  useEffect(() => {
    if (skuInputRef.current) {
      skuInputRef.current.focus();
    }
  }, []);

  // Handle barcode scan result
  const handleScan = (err: any, result: any) => {
    if (err) {
      setScanError('Scan error. Please try again.');
      return;
    }
    if (result) {
      form.setValue('sku', result.text);
      setShowScanner(false);
      setScanError(null);
      toast.success(`Scanned: ${result.text}`);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? 'Edit Inventory Item' : 'Add New Item'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode 
              ? 'Update the item details below' 
              : 'Fill in the form to add a new item to inventory'}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/inventory')}>
          Back to Inventory
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>
            {isEditMode 
              ? 'Update the item information' 
              : 'Enter the details for the new inventory item'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., MacBook Pro M2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Apple" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="store"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Location *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a store" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stores.map((store) => (
                            <SelectItem key={store} value={store}>
                              {store}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Stock *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lowStockThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Low Stock Threshold *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="5"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        When stock reaches this number, it will be marked as low stock
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., MBPM2-256-SILVER" {...field} ref={skuInputRef} />
                      </FormControl>
                      <FormDescription>
                        Leave blank to auto-generate
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Manual Serial Number Input with Camera Scanner */}
                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number</FormLabel>
                      {/* Scanner Controls */}
                      <div className="flex gap-2 mb-2">
                        <Button type="button" className="bg-green-600 text-white hover:bg-green-700" onClick={() => {
                          setShowScanner(true);
                          setCameraLoading(true);
                          setScanError(null);
                          setCameraError(null);
                          // Add camera startup timeout
                          const timeoutId = setTimeout(() => {
                            setCameraLoading(false);
                            setCameraError('Camera did not start. Please check permissions or try another device/browser.');
                          }, 5000);
                          setCameraTimeoutId(timeoutId);
                        }}>
                          Scan with Camera
                        </Button>
                        <span className="text-xs text-muted-foreground">Or enter manually below</span>
                      </div>
                      {showScanner && (
                        <div className="mb-4">
                          {cameraLoading && !cameraError && (
                            <div className="flex items-center justify-center mb-2">
                              <svg className="animate-spin h-6 w-6 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Starting camera...</span>
                            </div>
                          )}
                          <video ref={zxingRef} style={{ width: 300, height: 200, borderRadius: 8, background: '#000' }} onLoadedData={() => {
                            setCameraLoading(false);
                            if (cameraTimeoutId) {
                              clearTimeout(cameraTimeoutId);
                              setCameraTimeoutId(null);
                            }
                          }} />
                          <Button type="button" variant="outline" onClick={() => {
                            setShowScanner(false);
                            setCameraLoading(false);
                            if (cameraTimeoutId) {
                              clearTimeout(cameraTimeoutId);
                              setCameraTimeoutId(null);
                            }
                          }}>
                            Close Scanner
                          </Button>
                          {scanError && <div className="text-red-500 text-xs mt-1">{scanError}</div>}
                          {cameraError && (
                            <div className="text-red-600 text-sm mt-2">
                              {cameraError}
                              <div className="text-xs text-gray-500 mt-1">
                                Make sure your browser has permission to access the camera. Look for a camera icon in the address bar or check your browser settings.<br/>
                                If you are not on localhost, use HTTPS for camera access.
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <FormControl>
                        <Input placeholder="Enter serial number manually (optional)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the product's serial number or scan with camera
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter a detailed description of the product..." 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/inventory')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : isEditMode ? 'Update Item' : 'Create Item'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryForm;
