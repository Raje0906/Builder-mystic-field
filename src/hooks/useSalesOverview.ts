import { useState, useEffect } from 'react';
import { safeApiClient } from '@/services/safeApi';

interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  // Add other stats fields if available from the backend
}

interface Sale {
  _id: string;
  customer: {
    name: string;
  };
  items: {
    product: {
      name: string;
    };
  }[];
  totalAmount: number;
  createdAt: string;
  status: string;
}

export function useSalesOverview() {
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsResponse, salesResponse] = await Promise.all([
          safeApiClient.safeRequest<{ data: SalesStats }>('/sales/stats'),
          safeApiClient.safeRequest<{ data: { sales: Sale[] } }>('/sales?limit=5'),
        ]);

        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data.data);
        } else {
          throw new Error(statsResponse.error || 'Failed to fetch stats');
        }

        if (salesResponse.success && salesResponse.data) {
          setRecentSales(salesResponse.data.data.sales);
        } else {
          throw new Error(salesResponse.error || 'Failed to fetch recent sales');
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { stats, recentSales, loading, error };
} 