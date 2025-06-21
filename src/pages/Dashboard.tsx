import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Wrench,
  Users,
  Package,
  IndianRupee,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  TooltipProps,
} from 'recharts';
import { toast } from 'sonner';

// Define types for our data models
interface Sale {
  id: string;
  amount?: number;
  total?: number;
  items?: Array<{ id: string; quantity: number; price: number }>;
  date?: string;
  status?: string;
}

interface Repair {
  id: string;
  device?: string;
  status?: string;
  date?: string;
  cost?: number;
}

interface Customer {
  id: string;
  name?: string;
  email?: string;
  isActive: boolean;
  joinDate?: string;
}

interface Product {
  id: string;
  name?: string;
  stockQuantity?: number;
  minStockLevel?: number;
  price?: number;
  category?: string;
}

interface DashboardMetrics {
  totalSales: number;
  totalRevenue: number;
  activeCustomers: number;
  lowStockItems: number;
  salesTrend: number;
  revenueTrend: number;
}

interface ChartData {
  name: string;
  sales: number;
  [key: string]: any;
}

interface StoreData {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  repairs: number;
  color?: string;
}

interface Activity {
  id: string;
  type: 'sale' | 'repair' | 'inventory' | 'customer';
  title: string;
  description: string;
  timestamp: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}
import { useApiHealth } from '@/hooks/useApi';
import SystemStatus from '@/components/SystemStatus';

// Mock data initialization
const initializeData = () => ({
  sales: [] as Sale[],
  repairs: [] as Repair[],
  customers: [] as Customer[],
  products: [] as Product[]
});

// Mock API functions
const fetchSales = async (): Promise<Sale[]> => [];
const fetchRepairs = async (): Promise<Repair[]> => [];
const fetchCustomers = async (): Promise<Customer[]> => [];
const fetchProducts = async (): Promise<Product[]> => [];

// Mock store data
const stores: StoreData[] = [
  { 
    id: '1', 
    name: 'Main Store', 
    sales: 0, 
    revenue: 0, 
    repairs: 0,
    color: '#3b82f6' 
  },
  { 
    id: '2', 
    name: 'Downtown', 
    sales: 0, 
    revenue: 0, 
    repairs: 0,
    color: '#10b981' 
  },
  { 
    id: '3', 
    name: 'Uptown', 
    sales: 0, 
    revenue: 0, 
    repairs: 0,
    color: '#f59e0b' 
  },
];

// Custom tooltip component for charts
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={`tooltip-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalSales: 0,
    totalRevenue: 0,
    activeCustomers: 0,
    lowStockItems: 0,
    salesTrend: 0,
    revenueTrend: 0,
  });
  const [salesData, setSalesData] = useState<ChartData[]>([]);
  const [storeMetrics, setStoreMetrics] = useState<StoreData[]>(stores);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHealthy, setIsHealthy] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(true);
  const { lastCheck: lastChecked } = useApiHealth();

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch data in parallel
      const [sales, repairs, customers, products] = await Promise.all([
        fetchSales(),
        fetchRepairs(),
        fetchCustomers(),
        fetchProducts(),
      ]);

      // Calculate metrics
      const totalSales = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      const activeCustomers = customers.filter(c => c.isActive).length;
      const lowStockItems = products.filter(p => (p.stockQuantity || 0) <= (p.minStockLevel || 0)).length;
      
      // Calculate trends (simplified example)
      const salesTrend = sales.length > 0 ? 5.2 : 0;
      const revenueTrend = sales.length > 0 ? 8.7 : 0;

      setMetrics({
        totalSales,
        totalRevenue,
        activeCustomers,
        lowStockItems,
        salesTrend,
        revenueTrend,
      });

      // Prepare chart data
      const monthlySales = Array(12).fill(0).map((_, index) => ({
        name: new Date(2023, index).toLocaleString('default', { month: 'short' }),
        sales: Math.floor(Math.random() * 1000) + 500,
      }));
      setSalesData(monthlySales);

      // Prepare store metrics with random data
      const updatedStoreMetrics = stores.map(store => ({
        ...store,
        sales: Math.floor(Math.random() * 1000),
        revenue: Math.floor(Math.random() * 5000) + 1000,
        repairs: Math.floor(Math.random() * 50),
      }));
      setStoreMetrics(updatedStoreMetrics);

      // Prepare recent activity
      const activities: Activity[] = [
        ...sales.slice(0, 5).map(sale => ({
          id: `sale-${sale.id}`,
          type: 'sale' as const,
          title: `New Sale: ${sale.id}`,
          description: `$${sale.total?.toFixed(2)} - ${sale.items?.length || 0} items`,
          timestamp: sale.date || new Date().toISOString(),
        })),
        ...repairs.slice(0, 3).map(repair => ({
          id: `repair-${repair.id}`,
          type: 'repair' as const,
          title: `Repair ${repair.status}`,
          description: repair.device || 'Device',
          timestamp: repair.date || new Date().toISOString(),
        })),
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

      setRecentActivity(activities);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <div className="mt-2">
                <Button
                  variant="outline"
                  onClick={loadDashboardData}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* System Status Bar */}
      <SystemStatus isHealthy={isHealthy} lastChecked={lastChecked} />
      
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.salesTrend >= 0 ? (
                <span className="text-green-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {metrics.salesTrend}% from last month
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {Math.abs(metrics.salesTrend)}% from last month
                </span>
              )}
            </p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{metrics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.revenueTrend >= 0 ? (
                <span className="text-green-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {metrics.revenueTrend}% from last month
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {Math.abs(metrics.revenueTrend)}% from last month
                </span>
              )}
            </p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.lowStockItems}</div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Stock Status</span>
                <span>{Math.round((metrics.lowStockItems / 50) * 100)}%</span>
              </div>
              <Progress value={(metrics.lowStockItems / 50) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly sales performance</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>


        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Store Performance</CardTitle>
            <CardDescription>Sales by store location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={storeMetrics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                    label={({ name, percent }) => 
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {storeMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest sales and repairs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 mr-3">
                    {activity.type === 'sale' ? (
                      <div className="p-2 rounded-full bg-green-100 text-green-600">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                        <Wrench className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No recent activity
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch data in parallel
      const [sales, repairs, customers, products] = await Promise.all([
        fetchSales(),
        fetchRepairs(),
        fetchCustomers(),
        fetchProducts(),
      ]);

      // Calculate metrics
      const totalSales = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      const activeCustomers = customers.filter((c) => c.isActive).length;
      const lowStockItems = products.filter(
        (p) => (p.stockQuantity || 0) <= (p.minStockLevel || 0)
      ).length;

      // Calculate trends (simplified example)
      const salesTrend = sales.length > 0 ? 5.2 : 0; // Replace with actual trend calculation
      const revenueTrend = sales.length > 0 ? 8.7 : 0; // Replace with actual trend calculation

      setMetrics({
        totalSales,
        totalRevenue,
        activeCustomers,
        lowStockItems,
        salesTrend,
        revenueTrend,
      });

      // Prepare chart data
      const monthlySales = Array(12)
        .fill(0)
        .map((_, index) => ({
          name: new Date(2023, index).toLocaleString('default', { month: 'short' }),
          sales: Math.floor(Math.random() * 1000) + 500,
        }));
      setSalesData(monthlySales);

      // Prepare store metrics (simplified)
      const updatedStoreMetrics = stores.map((store) => ({
        ...store,
        sales: Math.floor(Math.random() * 1000),
        revenue: Math.floor(Math.random() * 5000) + 1000,
        repairs: Math.floor(Math.random() * 50),
      }));
      zsetStoreMetrics(updatedStoreMetrics);

      // Prepare recent activity
      const activities: Activity[] = [
        ...sales
          .slice(0, 5)
          .map((sale) => ({
            id: `sale-${sale.id}`,
            type: 'sale' as const,
            title: `New Sale: ${sale.id}`,
            description: `$${sale.total?.toFixed(2)} - ${sale.items?.length || 0} items`,
            timestamp: sale.date || new Date().toISOString(),
          })),
        ...repairs
          .slice(0, 3)
          .map((repair) => ({
            id: `repair-${repair.id}`,
            type: 'repair' as const,
            title: `Repair ${repair.status}`,
            description: repair.device || 'Device',
            timestamp: repair.date || new Date().toISOString(),
          })),
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

      setRecentActivity(activities);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <div className="mt-2">
                <Button
                  variant="outline"
                  onClick={loadDashboardData}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Status Bar */}
      <SystemStatus isHealthy={isHealthy} lastChecked={lastChecked} />
      
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.salesTrend >= 0 ? (
                <span className="text-green-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {metrics.salesTrend}% from last month
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {Math.abs(metrics.salesTrend)}% from last month
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{metrics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.revenueTrend >= 0 ? (
                <span className="text-green-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {metrics.revenueTrend}% from last month
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {Math.abs(metrics.revenueTrend)}% from last month
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.lowStockItems}</div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Stock Status</span>
                <span>{Math.round((metrics.lowStockItems / 50) * 100)}%</span>
              </div>
              <Progress value={(metrics.lowStockItems / 50) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly sales performance</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Store Performance</CardTitle>
            <CardDescription>Sales by store location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={storeMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest sales and repairs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 mr-3">
                    {activity.type === 'sale' ? (
                      <div className="p-2 rounded-full bg-green-100 text-green-600">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                        <Wrench className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No recent activity
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

// Types moved to @/types/dashboard.ts

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [storeData, setStoreData] = useState<StoreData[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isConnected } = useApiHealth();

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Initialize mock data
      initializeData();
      
      // Fetch data
      const [sales, repairs, customers, products] = await Promise.all([
        getSales(),
        getRepairs(),
        getCustomers(),
        getProducts(),
      ]);

      // Process data and update state
      const metrics = calculateMetrics(sales, repairs, customers, products);
      const chartData = generateChartData(sales, repairs);
      const storeData = generateStoreData(sales, repairs);
      const recentActivity = generateRecentActivity(sales, repairs);

      setMetrics(metrics);
      setChartData(chartData);
      setStoreData(storeData);
      setRecentActivity(recentActivity);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const calculateMetrics = (
    sales: Sale[],
    repairs: Repair[],
    customers: Customer[],
    products: Product[]
  ): DashboardMetrics => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const currentMonthSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getMonth() === currentMonth && 
             saleDate.getFullYear() === currentYear;
    });

    const lastMonthSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const year = currentMonth === 0 ? currentYear - 1 : currentYear;
      return saleDate.getMonth() === lastMonth && 
             saleDate.getFullYear() === year;
    });

    const currentMonthRevenue = currentMonthSales.reduce(
      (sum, sale) => sum + sale.totalAmount, 0
    );

    const lastMonthRevenue = lastMonthSales.length > 0 
      ? lastMonthSales.reduce((sum, sale) => sum + sale.totalAmount, 0) 
      : 0;

    const monthlyGrowth = lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    const activeRepairs = repairs.filter(
      repair => repair.status === 'in-progress' || repair.status === 'pending'
    ).length;

    const completedRepairs = repairs.filter(
      repair => repair.status === 'completed' || repair.status === 'delivered'
    ).length;

    const lowStockItems = products.filter(
      product => product.stock_quantity <= (product.min_stock_level || 0)
    ).length;

    // Calculate average repair time (in days)
    const completedRepairData = repairs.filter(
      repair => repair.status === 'completed' && repair.createdAt && repair.updatedAt
    );

    const avgRepairTime = completedRepairData.length > 0
      ? completedRepairData.reduce((sum, repair) => {
          const start = new Date(repair.createdAt).getTime();
          const end = new Date(repair.updatedAt).getTime();
          return sum + (end - start) / (1000 * 60 * 60 * 24); // Convert to days
        }, 0) / completedRepairData.length
      : 0;

    return {
      totalSales: currentMonthSales.length,
      totalRevenue: currentMonthRevenue,
      activeRepairs,
      completedRepairs,
      totalCustomers: customers.length,
      lowStockItems,
      monthlyGrowth,
      repairAvgTime: parseFloat(avgRepairTime.toFixed(1)),
    };
  };

  const generateChartData = (sales: Sale[], repairs: Repair[]): ChartData[] => {
    const days = 7;
    const result: ChartData[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      const daySales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.toDateString() === date.toDateString();
      });
      
      const dayRepairs = repairs.filter(repair => {
        const repairDate = new Date(repair.createdAt);
        return repairDate.toDateString() === date.toDateString();
      });
      
      const dayRevenue = daySales.reduce(
        (sum, sale) => sum + sale.totalAmount, 0
      );
      
      result.push({
        name: dateStr,
        sales: daySales.length,
        repairs: dayRepairs.length,
        revenue: dayRevenue,
      });
    }
    
    return result;
  };

  const generateStoreData = (sales: Sale[], repairs: Repair[]): StoreData[] => {
    return stores.map(store => {
      const storeSales = sales.filter(sale => sale.storeId === store.id);
      const storeRepairs = repairs.filter(repair => repair.storeId === store.id);
      
      return {
        ...store,
        sales: storeSales.length,
        revenue: storeSales.reduce((sum, sale) => sum + sale.totalAmount, 0),
        repairs: storeRepairs.length,
      };
    });
  };

  const generateRecentActivity = (sales: Sale[], repairs: Repair[]): Activity[] => {
    const activities: Activity[] = [];
    
    // Add recent sales
    const recentSales = [...sales]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
      
    recentSales.forEach(sale => {
      activities.push({
        id: `sale-${sale.id}`,
        type: 'sale',
        title: 'New Sale',
        description: `Sale #${sale.id} for ₹${sale.totalAmount.toFixed(2)}`,
        timestamp: new Date(sale.date),
        status: sale.status as 'completed' | 'pending' | 'cancelled',
      });
    });
    
    // Add recent repairs
    const recentRepairs = [...repairs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
      
    recentRepairs.forEach(repair => {
      activities.push({
        id: `repair-${repair.id}`,
        type: 'repair',
        title: 'Repair Update',
        description: `Repair for ${repair.device} is ${repair.status}`,
        timestamp: new Date(repair.updatedAt),
        status: repair.status === 'completed' ? 'completed' : 
               repair.status === 'cancelled' ? 'cancelled' : 'in-progress',
      });
    });
    
    // Sort all activities by timestamp
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  };

  const loadDashboardData = () => {
    const sales = getSales();
    const repairs = getRepairs();
    const customers = getCustomers();
    const products = getProducts();

    // Calculate metrics
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthSales = sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      return (
        saleDate.getMonth() === currentMonth &&
        saleDate.getFullYear() === currentYear
      );
    });

    const lastMonthSales = sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const year = currentMonth === 0 ? currentYear - 1 : currentYear;
      return (
        saleDate.getMonth() === lastMonth && saleDate.getFullYear() === year
      );
    });

    const currentMonthRevenue = currentMonthSales.reduce(
      (total, sale) => total + sale.totalAmount,
      0,
    );
    const lastMonthRevenue = lastMonthSales.reduce(
      (total, sale) => total + sale.totalAmount,
      0,
    );

    const monthlyGrowth =
      lastMonthRevenue > 0
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    const activeRepairs = repairs.filter(
      (repair) =>
        !["completed", "delivered", "cancelled"].includes(repair.status),
    );

    const completedRepairs = repairs.filter(
      (repair) => repair.status === "completed",
    );

    // Calculate average repair time
    const completedWithDates = completedRepairs.filter(
      (repair) => repair.updatedAt && repair.createdAt,
    );
    const avgRepairTime =
      completedWithDates.length > 0
        ? completedWithDates.reduce((total, repair) => {
            const start = new Date(repair.createdAt).getTime();
            const end = new Date(repair.updatedAt).getTime();
            return total + (end - start);
          }, 0) /
          completedWithDates.length /
          (1000 * 60 * 60 * 24) // Convert to days
        : 0;

    // Low stock items
    const lowStockItems = products.filter((product) => {
      const totalStock = product.inventory.reduce(
        (total: number, inv: any) => total + inv.quantity,
        0,
      );
      return totalStock <= 10;
    });

    const metricsData: DashboardMetrics = {
      totalSales: currentMonthSales.length,
      totalRevenue: currentMonthRevenue,
      activeRepairs: activeRepairs.length,
      completedRepairs: completedRepairs.length,
      totalCustomers: customers.length,
      lowStockItems: lowStockItems.length,
      monthlyGrowth,
      repairAvgTime: Math.round(avgRepairTime * 10) / 10,
    };

    setMetrics(metricsData);

    // Chart data - last 7 days
    const chartData: ChartData[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const daySales = sales.filter((sale) => {
        const saleDate = new Date(sale.date);
        return saleDate.toDateString() === date.toDateString();
      });

      const dayRepairs = repairs.filter((repair) => {
        const repairDate = new Date(repair.createdAt);
        return repairDate.toDateString() === date.toDateString();
      });

      const dayRevenue = daySales.reduce(
        (total, sale) => total + sale.totalAmount,
        0,
      );

      chartData.push({
        name: dateStr,
        sales: daySales.length,
        repairs: dayRepairs.length,
        revenue: dayRevenue,
      });
    }

    setChartData(chartData);

    // Store performance data
    const storePerformance = stores.map((store) => {
      const storeSales = sales.filter((sale) => sale.storeId === store.id);
      const storeRepairs = repairs.filter(
        (repair) => repair.storeId === store.id,
      );
      const storeRevenue = storeSales.reduce(
        (total, sale) => total + sale.totalAmount,
        0,
      );

      return {
        id: store.id,
        name: store.name,
        sales: storeSales.length,
        repairs: storeRepairs.length,
        revenue: storeRevenue,
        color: store.color,
      };
    });

    setStoreData(storePerformance);

    // Recent activity
    const recentSales = sales
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((sale) => {
        const customer = customers.find((c) => c.id === sale.customerId);
        return {
          id: sale.id,
          type: "sale",
          customer: customer?.name || "Unknown Customer",
          amount: sale.totalAmount,
          date: new Date(sale.date).toLocaleDateString(),
          status: sale.status,
        };
      });

    const recentRepairs = repairs
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5)
      .map((repair) => {
        const customer = customers.find((c) => c.id === repair.customerId);
        return {
          id: repair.id,
          type: "repair",
          customer: customer?.name || "Unknown Customer",
          device: `${repair.device.brand} ${repair.device.model}`,
          status: repair.status,
          priority: repair.priority,
          date: new Date(repair.createdAt).toLocaleDateString(),
        };
      });

    const combined = [...recentSales, ...recentRepairs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);

    setRecentActivity(combined);
  };

  if (!metrics) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your laptop store CRM</p>
          {!isConnected && (
            <Badge variant="secondary" className="mt-2">
              Demo Mode - Local Storage Only
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
          <Button size="sm" asChild>
            <Link to="/reports">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.monthlyGrowth > 0 ? (
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />+
                  {metrics.monthlyGrowth.toFixed(1)}% from last month
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {metrics.monthlyGrowth.toFixed(1)}% from last month
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{metrics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              This month's total revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Repairs
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeRepairs}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.completedRepairs} completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Total registered customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales & Repairs Trend</CardTitle>
            <CardDescription>Last 7 days performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Sales"
                />
                <Line
                  type="monotone"
                  dataKey="repairs"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Repairs"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Performance</CardTitle>
            <CardDescription>Revenue by store location</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={storeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) =>
                    `${name}: ₹${value.toLocaleString()}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {storeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `₹${value.toLocaleString()}`,
                    "Revenue",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.lowStockItems > 0 && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Package className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Low Stock Alert</p>
                  <p className="text-sm text-gray-600">
                    {metrics.lowStockItems} items running low
                  </p>
                </div>
              </div>
            )}

            {metrics.repairAvgTime > 5 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Repair Time Alert</p>
                  <p className="text-sm text-gray-600">
                    Average repair time: {metrics.repairAvgTime} days
                  </p>
                </div>
              </div>
            )}

            {metrics.lowStockItems === 0 && metrics.repairAvgTime <= 5 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">All Systems Normal</p>
                  <p className="text-sm text-gray-600">
                    No alerts at this time
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-1">
                    {activity.type === "sale" ? (
                      <ShoppingCart className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Wrench className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.customer}</p>
                    <p className="text-xs text-gray-600">
                      {activity.type === "sale"
                        ? `Sale: ₹${activity.amount.toLocaleString()}`
                        : `Repair: ${activity.device}`}
                    </p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                  <Badge
                    variant={
                      activity.status === "completed"
                        ? "default"
                        : activity.status === "pending"
                          ? "secondary"
                          : "outline"
                    }
                    className="text-xs"
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <SystemStatus />
      </div>
    </div>
  );
}

  // Custom Tooltip component for charts
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <SystemStatus isConnected={isConnected} />
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {metrics && (
        <div className="grid gap-6">
          {/* Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sales
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalSales}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.monthlyGrowth >= 0 ? (
                    <span className="text-green-500">
                      <TrendingUp className="inline h-3 w-3" /> {metrics.monthlyGrowth.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-red-500">
                      <TrendingDown className="inline h-3 w-3" /> {Math.abs(metrics.monthlyGrowth).toFixed(1)}%
                    </span>
                  )} from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{metrics.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.monthlyGrowth >= 0 ? (
                    <span className="text-green-500">
                      <TrendingUp className="inline h-3 w-3" /> {metrics.monthlyGrowth.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-red-500">
                      <TrendingDown className="inline h-3 w-3" /> {Math.abs(metrics.monthlyGrowth).toFixed(1)}%
                    </span>
                  )} from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Repairs
                </CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeRepairs}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.completedRepairs} completed this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Low Stock Items
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.lowStockItems}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.lowStockItems > 0 ? (
                    <span className="text-yellow-600">
                      <AlertTriangle className="inline h-3 w-3" /> Needs attention
                    </span>
                  ) : (
                    <span className="text-green-500">
                      <CheckCircle className="inline h-3 w-3" /> All good
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 10,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  {recentActivity.length} activities this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center">
                      <div className="mr-4">
                        {activity.type === 'sale' ? (
                          <ShoppingCart className="h-5 w-5 text-green-500" />
                        ) : activity.type === 'repair' ? (
                          <Wrench className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Users className="h-5 w-5 text-purple-500" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Sales by Store</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={storeData}
                      margin={{
                        top: 5,
                        right: 10,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="sales"
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="#82ca9d"
                        radius={[4, 4, 0, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
                <CardDescription>
                  {metrics.lowStockItems} items need attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">In Stock</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((1 - metrics.lowStockItems / Math.max(1, metrics.lowStockItems)) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={(1 - metrics.lowStockItems / Math.max(1, metrics.lowStockItems)) * 100}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Repairs</span>
                      <span className="text-sm text-muted-foreground">
                        {metrics.activeRepairs} active
                      </span>
                    </div>
                    <Progress
                      value={(metrics.completedRepairs / Math.max(1, metrics.completedRepairs + metrics.activeRepairs)) * 100}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Average Repair Time</span>
                      <span className="text-sm text-muted-foreground">
                        {metrics.repairAvgTime} days
                      </span>
                    </div>
                    <Progress
                      value={Math.min(100, metrics.repairAvgTime * 10)}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
