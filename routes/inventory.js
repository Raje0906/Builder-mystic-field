import express from 'express';
import Inventory from '../models/Inventory.js';
import mongoose from 'mongoose';

const router = express.Router();

// Middleware to validate ObjectId
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid inventory item ID' });
  }
  next();
};

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    console.log('Received GET /inventory with query:', req.query);
    const { category, store, lowStock, search, activeOnly } = req.query;
    const query = {};

    // Handle activeOnly filter (default to true if not specified)
    if (activeOnly === 'true' || activeOnly === undefined) {
      query.isActive = true;
    }

    if (category) query.category = category;
    if (store) query.store = store;
    if (lowStock === 'true') {
      query.stock = { $lte: 10 }; // Assuming 10 is the threshold for low stock
    }
    if (search) {
      query.$text = { $search: search };
    }

    console.log('MongoDB query:', JSON.stringify(query, null, 2));
    const items = await Inventory.find(query).sort({ name: 1 });
    console.log(`Found ${items.length} items`);
    res.json(items);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new inventory item
router.post('/', async (req, res) => {
  try {
    const { name, brand, category, stock, price, lowStockThreshold, store, description, sku } = req.body;
    
    // Basic validation
    if (!name || !brand || !category || stock === undefined || !price || !store) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newItem = new Inventory({
      name,
      brand,
      category,
      stock: parseInt(stock, 10) || 0,
      price: parseFloat(price) || 0,
      lowStockThreshold: parseInt(lowStockThreshold, 10) || 5, // Default to 5 if not provided
      store,
      description: description || '',
      sku: sku || undefined, // Will be auto-generated if not provided
      isActive: true
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    if (error.code === 11000) {
      // Duplicate key error (e.g., duplicate SKU)
      return res.status(400).json({
        message: 'Duplicate entry',
        field: Object.keys(error.keyPattern)[0],
        value: error.keyValue[Object.keys(error.keyPattern)[0]]
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single inventory item
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update inventory item
router.put('/:id', validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Prevent stock updates through this endpoint (use the dedicated endpoint for that)
    if ('stock' in updateData) {
      delete updateData.stock;
    }

    const item = await Inventory.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add stock to inventory item
router.post('/:id/add-stock', validateObjectId, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    item.stock += parseInt(quantity, 10);
    await item.save();

    // Here you might want to create a stock movement record
    // await StockMovement.create({
    //   item: item._id,
    //   quantity: quantity,
    //   type: 'addition',
    //   reason: 'manual_adjustment',
    //   user: req.user._id // If you have user authentication
    // });

    res.json(item);
  } catch (error) {
    console.error('Error adding stock:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete inventory item (soft delete)
router.delete('/:id', validateObjectId, async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json({ message: 'Inventory item deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating inventory item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
