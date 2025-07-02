import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  lowStockThreshold: {
    type: Number,
    required: true,
    min: 0,
    default: 5
  },
  store: {
    type: String,
    required: true,
    trim: true
  },
  // Additional fields can be added here
  description: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
inventorySchema.index({ name: 'text', brand: 'text', category: 'text' });

// Virtual for checking if stock is low
inventorySchema.virtual('isLowStock').get(function() {
  return this.stock <= this.lowStockThreshold;
});

// Pre-save hook to generate SKU if not provided
inventorySchema.pre('save', function(next) {
  if (!this.sku) {
    // Generate a simple SKU (you can customize this logic)
    const prefix = (this.brand.slice(0, 3) + this.name.slice(0, 3)).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.sku = `${prefix}-${random}`;
  }
  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
