import { useState, useEffect } from 'react';
import { safeApiClient } from '@/services/safeApi';

interface Product {
  _id: string;
  name: string;
  brand: string;
  model: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  isActive: boolean;
}

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      const response = await safeApiClient.safeRequest<Product[]>('/inventory');
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setError(response.error || 'Failed to fetch inventory');
      }
      setLoading(false);
    };

    fetchInventory();
  }, []);

  return { products, loading, error };
} 