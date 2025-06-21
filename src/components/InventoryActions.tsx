import React, { useState } from 'react';
import { toast } from 'react-toastify';
import inventoryService, { InventoryItem } from '../services/inventoryService';

interface InventoryActionsProps {
  item: InventoryItem;
  onUpdate: () => void;
}

export default function InventoryActions({ item, onUpdate }: InventoryActionsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [stockToAdd, setStockToAdd] = useState(0);
  const [formData, setFormData] = useState<{
    name: string;
    brand: string;
    category: string;
    price: number;
    stock: number;
    lowStockThreshold: number;
    store: string;
    description: string;
  }>({
    name: item.name || '',
    brand: item.brand || '',
    category: item.category || '',
    price: item.price || 0,
    stock: item.stock || 0,
    lowStockThreshold: item.lowStockThreshold || 5,
    store: item.store || '',
    description: item.description || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await inventoryService.updateInventoryItem(item._id, formData);
      onUpdate();
      setShowEditModal(false);
      toast.success('Item updated successfully');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockToAdd || stockToAdd <= 0) {
      toast.warning('Please enter a valid quantity');
      return;
    }
    
    setIsLoading(true);
    try {
      await inventoryService.addStock(item._id, stockToAdd);
      setStockToAdd(0);
      onUpdate();
      setShowStockModal(false);
      toast.success(`Added ${stockToAdd} items to stock`);
    } catch (error) {
      console.error('Error adding stock:', error);
      toast.error('Failed to add stock');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target;
    const value = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' 
        ? parseFloat(value) || 0 
        : type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value
    }));
  };
  
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  return (
    <div className="flex gap-2">
      {/* Edit Button */}
      <button 
        onClick={() => setShowEditModal(true)}
        className="text-blue-600 hover:text-blue-900"
        title="Edit Item"
      >
        Edit
      </button>

      {/* Stock Button */}
      <button 
        onClick={() => setShowStockModal(true)}
        className="text-green-600 hover:text-green-900"
        title="Add Stock"
      >
        Stock
      </button>

      {/* View Button */}
      <button 
        onClick={() => setShowViewModal(true)}
        className="text-purple-600 hover:text-purple-900"
        title="View Details"
      >
        View
      </button>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit {item.name}</h3>
            <form onSubmit={handleEdit}>
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <input
                    type={typeof value === 'number' ? 'number' : 'text'}
                    name={key}
                    value={value}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={key === 'id'}
                  />
                </div>
              ))}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Stock - {item.name}</h3>
            <p className="mb-4">Current Stock: {item.stock}</p>
            <form onSubmit={handleAddStock}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity to Add
                </label>
                <input
                  type="number"
                  min="1"
                  value={stockToAdd}
                  onChange={(e) => setStockToAdd(parseInt(e.target.value) || 0)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  disabled={isLoading || stockToAdd <= 0}
                >
                  {isLoading ? 'Adding...' : 'Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{item.name} Details</h3>
              <button 
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(item).map(([key, value]) => (
                <div key={key} className="border-b border-gray-100 pb-2">
                  <span className="font-medium text-gray-600">
                    {key.charAt(0).toUpperCase() + key.slice(1)}:
                  </span>{' '}
                  <span className="text-gray-800">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
