import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

export interface InventoryItem {
  _id: string;
  name: string;
  brand: string;
  category: string;
  stock: number;
  price: number;
  lowStockThreshold: number;
  store: string;
  description?: string;
  sku?: string;
  isLowStock?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const inventoryService = {
  // Get all inventory items with optional filters
  async getInventory(filters: {
    category?: string;
    store?: string;
    lowStock?: boolean;
    search?: string;
    activeOnly?: boolean;
  } = {}): Promise<InventoryItem[]> {
    try {
      console.log('Sending request to:', `${API_URL}/inventory`);
      console.log('With filters:', filters);
      
      const response = await axios.get(`${API_URL}/inventory`, {
        params: filters,
        withCredentials: true,
      });
      
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      
      if (!Array.isArray(response.data)) {
        console.error('Expected array but got:', response.data);
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  },

  // Get single inventory item
  async getInventoryItem(id: string): Promise<InventoryItem> {
    try {
      const response = await axios.get(`${API_URL}/inventory/${id}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      throw error;
    }
  },

  // Update inventory item
  async updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const response = await axios.put(
        `${API_URL}/inventory/${id}`,
        data,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  },

  // Add stock to inventory item
  async addStock(id: string, quantity: number): Promise<InventoryItem> {
    try {
      const response = await axios.post(
        `${API_URL}/inventory/${id}/add-stock`,
        { quantity },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding stock:', error);
      throw error;
    }
  },

  // Delete inventory item (soft delete)
  async deleteInventoryItem(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/inventory/${id}`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  },

  // Create new inventory item
  async createInventoryItem(data: Omit<InventoryItem, '_id'>): Promise<InventoryItem> {
    try {
      const response = await axios.post(
        `${API_URL}/inventory`,
        data,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
  },
};

export default inventoryService;
