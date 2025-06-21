import {
  Customer,
  Product,
  Sale,
  Repair,
  SearchFilters,
  BarcodeResult,
  Report,
} from "@/types";
import { customers, products, sales, repairs, stores } from "./mockData";

// Local storage keys
const STORAGE_KEYS = {
  CUSTOMERS: "laptop-store-customers",
  PRODUCTS: "laptop-store-products",
  SALES: "laptop-store-sales",
  REPAIRS: "laptop-store-repairs",
};

// Initialize data in localStorage if not present
export const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REPAIRS)) {
    localStorage.setItem(STORAGE_KEYS.REPAIRS, JSON.stringify(repairs));
  }
};

// Customer operations
export const getCustomers = async (): Promise<Customer[]> => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  try {
    const response = await fetch(`${apiUrl}/customers`);
    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    // Fallback to local storage if API fails
    const localData = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return localData ? JSON.parse(localData) : [];
  }
};

export const getCustomer = async (id: string): Promise<Customer | null> => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  try {
    const response = await fetch(`${apiUrl}/customers/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch customer');
    }
    const result = await response.json();
    return {
      ...result.data,
      id: result.data._id || result.data.id,
    };
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
};

export const addCustomer = async (
  customer: Omit<Customer, "id" | "dateAdded" | "totalPurchases">,
): Promise<Customer> => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  try {
    // Ensure required address fields are present with defaults
    const { line1, city, state, pincode, ...restAddress } = customer.address || {};
    const requestBody = {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: {
        ...restAddress,
        line1: line1 || 'Not specified',
        city: city || 'Not specified',
        state: state || 'Not specified',
        pincode: pincode || '000000'
      }
    };

    const response = await fetch(`${apiUrl}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.errors?.[0]?.msg || errorData.message || 'Failed to add customer';
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return {
      ...result.data,
      id: result.data._id || result.data.id,
      dateAdded: result.data.createdAt || new Date().toISOString().split("T")[0],
      totalPurchases: 0,
      status: "active",
    };
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};

export const updateCustomer = async (
  id: string,
  updates: Partial<Customer>,
): Promise<Customer | null> => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  try {
    const response = await fetch(`${apiUrl}/customers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update customer');
    }

    const result = await response.json();
    return {
      ...result.data,
      id: result.data._id || result.data.id,
    };
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

export const deleteCustomer = async (id: string): Promise<boolean> => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  try {
    const response = await fetch(`${apiUrl}/customers/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete customer');
    }

    return true;
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

// Product operations
export const getProducts = async (): Promise<Product[]> => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  const fallbackProducts: Product[] = [
    {
      id: 'fallback-1',
      name: 'Sample Laptop',
      brand: 'Sample Brand',
      model: 'Sample Model 2023',
      serialNumber: 'SN123456',
      barcode: '123456789012',
      category: 'laptops',
      price: 999.99,
      cost: 700.00,
      stock: 10,
      minStock: 2,
      storeId: 'store-1',
      specifications: {
        processor: 'Intel Core i5',
        ram: '8GB',
        storage: '256GB SSD',
        display: '15.6" FHD',
        os: 'Windows 11'
      },
      images: [],
      status: 'available',
      dateAdded: new Date().toISOString()
    }
  ];

  try {
    const response = await fetch(`${apiUrl}/products`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const products = data.data || [];
    
    // Ensure we always return at least the fallback products if the API returns an empty array
    return products.length > 0 ? products : fallbackProducts;
  } catch (error) {
    console.error('Error fetching products, using fallback data:', error);
    return fallbackProducts;
  }
};

export const updateProductStock = (
  productId: string,
  quantity: number,
): boolean => {
  const products = getProducts();
  const product = products.find((p) => p.id === productId);

  if (!product || product.stock < quantity) return false;

  product.stock -= quantity;
  product.status = product.stock === 0 ? "out-of-stock" : "available";
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  return true;
};

// Sales operations
export const getSales = (): Sale[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SALES);
  return data ? JSON.parse(data) : sales;
};

export const addSale = (sale: Omit<Sale, "id" | "date">): Sale => {
  const sales = getSales();
  const newSale: Sale = {
    ...sale,
    id: `sale-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
  };

  sales.push(newSale);
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));

  // Update product stock
  updateProductStock(sale.productId, sale.quantity);

  // Update customer total purchases
  getCustomers().then(customers => {
    const customer = customers.find((c: Customer) => c.id === sale.customerId);
    if (customer) {
      customer.totalPurchases += sale.finalAmount;
      customer.lastPurchase = newSale.date;
      // Get current customers and update the specific customer
      getCustomers().then(allCustomers => {
        const updatedCustomers = allCustomers.map(c => 
          c.id === customer.id ? customer : c
        );
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updatedCustomers));
      });
    }
  });

  return newSale;
};

// Repair operations
// Helper function to parse repair data with proper types
const parseRepair = (data: any): Repair => ({
  ...data,
  _id: data._id || `local-${Date.now()}`,
  dateReceived: data.dateReceived ? new Date(data.dateReceived) : new Date(),
  estimatedCompletion: data.estimatedCompletion ? new Date(data.estimatedCompletion) : undefined,
  actualCompletion: data.actualCompletion ? new Date(data.actualCompletion) : undefined,
  createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
  updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
  parts: Array.isArray(data.parts) ? data.parts : [],
  notes: Array.isArray(data.notes) ? data.notes : [],
  customerNotified: data.customerNotified || { whatsapp: false, email: false }
} as Repair);

export const getRepairs = async (): Promise<Repair[]> => {
  try {
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';
    const response = await fetch(`${baseUrl}/api/repairs`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch repairs: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data.map(parseRepair) : [];
  } catch (error) {
    console.error('Error fetching repairs from API, falling back to localStorage:', error);
    // Fallback to localStorage
    const repairsJson = localStorage.getItem(STORAGE_KEYS.REPAIRS);
    if (!repairsJson) return [];
    
    try {
      const data = JSON.parse(repairsJson);
      return Array.isArray(data) ? data.map(parseRepair) : [];
    } catch (parseError) {
      console.error('Error parsing localStorage repairs:', parseError);
      return [];
    }
  }
};

// Extend the Repair type to include customer info
interface RepairWithCustomer extends Omit<Repair, "_id" | "createdAt" | "updatedAt"> {
  customerName?: string;
  contactInfo?: {
    whatsappNumber: string;
    notificationEmail: string;
    consentGiven: boolean;
    consentDate: string;
  };
}

// Define the structure for the repair data we'll send to the API
interface RepairSubmission {
  customer: string;
  deviceType: string;
  brand: string;
  model: string;
  serialNumber: string;
  issueDescription: string;
  diagnosis: string;
  repairCost: number;
  partsCost: number;
  laborCost: number;
  priority: 'low' | 'medium' | 'high';
  status: string;
  notes: string[];
  dateReceived: string;
}

export const addRepair = async (
  repairData: RepairWithCustomer
): Promise<Repair> => {
  try {
    // Create customer data with required fields
    const customerData: Omit<Customer, 'id' | 'dateAdded' | 'totalPurchases'> = {
      name: repairData.customerName || 'Unknown Customer',
      email: repairData.contactInfo?.notificationEmail || '',
      phone: repairData.contactInfo?.whatsappNumber || '',
      address: {
        line1: '',
        city: 'Unknown',
        state: '',
        pincode: '',
        country: ''
      },
      status: 'active',
      totalPurchases: 0,
      dateAdded: new Date().toISOString()
    };

    // Create customer first
    const customer = await addCustomer(customerData);
    
    // Prepare repair data for API with proper typing
    const repairToSend: RepairSubmission = {
      customer: customer.id, // Use the created customer's ID
      deviceType: (repairData as any).deviceType || 'Laptop',
      brand: (repairData as any).deviceInfo?.brand || 'Unknown',
      model: (repairData as any).deviceInfo?.model || 'Unknown',
      serialNumber: (repairData as any).deviceInfo?.serialNumber || '',
      issueDescription: (repairData as any).issue || 'No description provided',
      diagnosis: 'Pending diagnosis',
      repairCost: 0,
      partsCost: 0,
      laborCost: 0,
      priority: 'medium',
      status: 'received',
      notes: [
        `Issue reported: ${(repairData as any).issue || 'No description'}`,
        `Contact: ${customerData.phone} | ${customerData.email}`
      ],
      dateReceived: new Date().toISOString()
    };

    // Log the data being sent for debugging
    console.log('Sending repair data:', JSON.stringify(repairToSend, null, 2));

    // Use the backend URL from environment variables or default to localhost:3002
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';
    const apiUrl = `${baseUrl}/api/repairs`;
    console.log('Making API request to:', apiUrl);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(repairToSend),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API request failed with status ${response.status}: ${errorData.message || 'Unknown error'}`
        );
      }

        const result = await response.json();
      console.log('Repair created successfully:', result);
      
      // Parse dates and ensure consistent structure
      const repairWithDates: Repair = {
        ...result,
        dateReceived: new Date(result.dateReceived || Date()),
        estimatedCompletion: result.estimatedCompletion ? new Date(result.estimatedCompletion) : undefined,
      };

      return repairWithDates;
    } catch (error) {
      console.error('Error creating repair via API:', error);
      
      // Fallback to localStorage if API fails
      console.warn('Falling back to localStorage for repair data');
      const repairs = await getRepairs();
      const newRepair: Repair = {
        ...repairData,
        id: `local-${Date.now()}`,
        dateReceived: new Date(),
        status: 'received',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const updatedRepairs = [...repairs, newRepair];
      localStorage.setItem(STORAGE_KEYS.REPAIRS, JSON.stringify(updatedRepairs));
      
      return newRepair;
    }
  } catch (error) {
    console.error('Error in addRepair:', error);
    throw error;
  }
};

export const updateRepair = async (
  id: string,
  updates: Partial<Repair>,
): Promise<Repair | null> => {
  try {
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';
    const response = await fetch(`${baseUrl}/api/repairs/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(updates),
      credentials: 'include'
    });

    if (response.ok) {
      const updatedRepair = await response.json();
      return parseRepair(updatedRepair);
    }
    
    // If API fails, fall back to localStorage
    const repairs = await getRepairs();
    const index = repairs.findIndex((r: Repair) => r._id === id);

    if (index === -1) return null;

    // If marking as completed, ensure we have completion timestamp
    if (updates.status === "completed" && !updates.actualCompletion) {
      updates.actualCompletion = new Date().toISOString();
    }

    // If marking as delivered, ensure customer notification is tracked
    if (updates.status === "delivered" && !updates.customerNotified?.lastNotified) {
      updates.customerNotified = {
        whatsapp: true,
        email: true,
        lastNotified: new Date().toISOString(),
      };
    }

    const updatedRepair = { ...repairs[index], ...updates, updatedAt: new Date().toISOString() };
    repairs[index] = updatedRepair;
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.REPAIRS, JSON.stringify(repairs));

    console.log(`Repair ${id} status updated to: ${updates.status}`);
    if (updates.status === "completed") {
      console.log(`Repair ${id} completed on: ${updates.actualCompletion}`);
    }

    return updatedRepair;
  } catch (error) {
    console.error('Error updating repair:', error);
    throw error;
  }
};

// Search functionality
export const searchCustomers = async (filters: SearchFilters): Promise<Customer[]> => {
  const { query, field } = filters;

  if (!query.trim()) {
    return getCustomers();
  }

  try {
    // Use the main customers endpoint with search parameter
    const searchParams = new URLSearchParams({
      search: query,
      field: field || 'all' // Include the field in the search parameters
    });

    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    const response = await fetch(`${apiUrl}/customers?${searchParams}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to search customers');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error searching customers:', error);
    // Fallback to local filtering if API fails
    const customers = await getCustomers();
    const searchQuery = query.toLowerCase();
    
    return customers.filter((customer) => {
      switch (field) {
        case "name":
          return customer.name?.toLowerCase().includes(searchQuery) || false;
        case "email":
          return customer.email?.toLowerCase().includes(searchQuery) || false;
        case "phone":
          return customer.phone?.includes(query) || false;
        default:
          return (
            customer.name?.toLowerCase().includes(searchQuery) ||
            customer.email?.toLowerCase().includes(searchQuery) ||
            customer.phone?.includes(query) ||
            false
          );
      }
    });
  }
};

export const searchByBarcode = async (barcode: string): Promise<Product | null> => {
  try {
    const response = await fetch(`http://localhost:3000/api/products/barcode/${barcode}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to search by barcode');
    }
    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.error('Error searching by barcode:', error);
    return null;
  }
};

export const searchBySerialNumber = async (serialNumber: string): Promise<Product | null> => {
  try {
    const response = await fetch(`http://localhost:3000/api/products/serial/${serialNumber}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to search by serial number');
    }
    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.error('Error searching by serial number:', error);
    return null;
  }
};

// Report generation
export const generateMonthlyReport = (year: number, month: number): Report => {
  const salesData = getSales().filter((sale) => {
    const saleDate = new Date(sale.date);
    return saleDate.getFullYear() === year && saleDate.getMonth() + 1 === month;
  });

  const repairsData = getRepairs().filter((repair) => {
    const repairDate = new Date(repair.dateReceived);
    return (
      repairDate.getFullYear() === year && repairDate.getMonth() + 1 === month
    );
  });

  return {
    period: "monthly",
    year,
    month,
    sales: calculateSalesMetrics(salesData),
    repairs: calculateRepairMetrics(repairsData),
  };
};

export const generateQuarterlyReport = (
  year: number,
  quarter: number,
): Report => {
  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = quarter * 3;

  const salesData = getSales().filter((sale) => {
    const saleDate = new Date(sale.date);
    const saleMonth = saleDate.getMonth() + 1;
    return (
      saleDate.getFullYear() === year &&
      saleMonth >= startMonth &&
      saleMonth <= endMonth
    );
  });

  const repairsData = getRepairs().filter((repair) => {
    const repairDate = new Date(repair.dateReceived);
    const repairMonth = repairDate.getMonth() + 1;
    return (
      repairDate.getFullYear() === year &&
      repairMonth >= startMonth &&
      repairMonth <= endMonth
    );
  });

  return {
    period: "quarterly",
    year,
    quarter,
    sales: calculateSalesMetrics(salesData),
    repairs: calculateRepairMetrics(repairsData),
  };
};

export const generateAnnualReport = (year: number): Report => {
  const salesData = getSales().filter((sale) => {
    const saleDate = new Date(sale.date);
    return saleDate.getFullYear() === year;
  });

  const repairsData = getRepairs().filter((repair) => {
    const repairDate = new Date(repair.dateReceived);
    return repairDate.getFullYear() === year;
  });

  return {
    period: "annually",
    year,
    sales: calculateSalesMetrics(salesData),
    repairs: calculateRepairMetrics(repairsData),
  };
};

// Helper functions for report calculations
const calculateSalesMetrics = (salesData: Sale[]) => {
  const totalRevenue = salesData.reduce(
    (sum, sale) => sum + sale.finalAmount,
    0,
  );
  const totalTransactions = salesData.length;
  const averageOrderValue =
    totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Top products
  const productSales = salesData.reduce(
    (acc, sale) => {
      const key = sale.productId;
      if (!acc[key]) {
        acc[key] = { quantity: 0, revenue: 0 };
      }
      acc[key].quantity += sale.quantity;
      acc[key].revenue += sale.finalAmount;
      return acc;
    },
    {} as Record<string, { quantity: number; revenue: number }>,
  );

  const products = getProducts();
  const topProducts = Object.entries(productSales)
    .map(([productId, data]) => {
      const product = products.find((p) => p.id === productId);
      return {
        productId,
        name: product?.name || "Unknown Product",
        quantity: data.quantity,
        revenue: data.revenue,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Store performance
  const storePerformance = stores.map((store) => {
    const storeSales = salesData.filter((sale) => sale.storeId === store.id);
    return {
      storeId: store.id,
      revenue: storeSales.reduce((sum, sale) => sum + sale.finalAmount, 0),
      transactions: storeSales.length,
    };
  });

  return {
    totalRevenue,
    totalTransactions,
    averageOrderValue,
    topProducts,
    storePerformance,
  };
};

const calculateRepairMetrics = (repairsData: Repair[]) => {
  const totalRepairs = repairsData.length;
  const completedRepairs = repairsData.filter(
    (r) => r.status === "completed",
  ).length;
  const totalRevenue = repairsData.reduce(
    (sum, repair) => sum + repair.actualCost,
    0,
  );

  // Average repair time for completed repairs
  const completedRepairsWithTime = repairsData.filter(
    (r) => r.status === "completed" && r.actualCompletion,
  );

  const averageRepairTime =
    completedRepairsWithTime.length > 0
      ? completedRepairsWithTime.reduce((sum, repair) => {
          const start = new Date(repair.dateReceived);
          const end = new Date(repair.actualCompletion!);
          const days = Math.ceil(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
          );
          return sum + days;
        }, 0) / completedRepairsWithTime.length
      : 0;

  // Top issues
  const issueCount = repairsData.reduce(
    (acc, repair) => {
      const issue = repair.issue.toLowerCase();
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const topIssues = Object.entries(issueCount)
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Store performance
  const storePerformance = stores.map((store) => {
    const storeRepairs = repairsData.filter(
      (repair) => repair.storeId === store.id,
    );
    return {
      storeId: store.id,
      repairs: storeRepairs.length,
      revenue: storeRepairs.reduce((sum, repair) => sum + repair.actualCost, 0),
    };
  });

  return {
    totalRepairs,
    completedRepairs,
    averageRepairTime,
    totalRevenue,
    topIssues,
    storePerformance,
  };
};

// Barcode scanning simulation
export const simulateBarcodeScan = async (): Promise<BarcodeResult> => {
  try {
    // Get products first
    const products = await getProducts();
    
    if (!products || products.length === 0) {
      throw new Error('No products available');
    }

    // Simulate scanning delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        
        if (!randomProduct || !randomProduct.barcode) {
          throw new Error('Invalid product data');
        }
        
        resolve({
          text: randomProduct.barcode,
          format: "CODE_128",
        });
      }, 2000);
    });
  } catch (error) {
    console.error('Error in barcode simulation:', error);
    // Return a default barcode if there's an error
    return {
      text: '123456789012',
      format: 'CODE_128',
    };
  }
};

// Real notification service integration
export const sendWhatsAppNotification = async (
  phone: string,
  message: string,
): Promise<boolean> => {
  try {
    const { realNotificationService } = await import(
      "@/services/realNotificationService"
    );
    const result = await realNotificationService.sendWhatsAppMessage(
      phone,
      message,
    );

    // Show visual confirmation
    const event = new CustomEvent("whatsapp-sent", {
      detail: {
        phone,
        message: message.substring(0, 100) + "...",
        timestamp: new Date().toISOString(),
        real: import.meta.env.VITE_ENABLE_REAL_NOTIFICATIONS === "true",
        messageId: result.messageId,
      },
    });
    window.dispatchEvent(event);

    if (result.success) {
      console.log(`✅ WhatsApp sent to ${phone} (ID: ${result.messageId})`);
      return true;
    } else {
      console.error(`❌ WhatsApp failed: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error("WhatsApp notification error:", error);
    return false;
  }
};

export const sendEmailNotification = async (
  email: string,
  subject: string,
  htmlContent: string,
): Promise<boolean> => {
  try {
    const { realNotificationService } = await import(
      "@/services/realNotificationService"
    );
    const result = await realNotificationService.sendEmail(
      email,
      subject,
      htmlContent,
    );

    // Show visual confirmation
    const event = new CustomEvent("email-sent", {
      detail: {
        email,
        subject,
        message: result.success
          ? "Email sent successfully"
          : `Failed: ${result.error}`,
        timestamp: new Date().toISOString(),
        real: import.meta.env.VITE_ENABLE_REAL_NOTIFICATIONS === "true",
        messageId: result.messageId,
      },
    });
    window.dispatchEvent(event);

    if (result.success) {
      console.log(`✅ Email sent to ${email} (ID: ${result.messageId})`);
      return true;
    } else {
      console.error(`❌ Email failed: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error("Email notification error:", error);
    return false;
  }
};
