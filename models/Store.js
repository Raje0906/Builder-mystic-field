import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Store address is required'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  manager: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
storeSchema.index({ name: 1 });
storeSchema.index({ status: 1 });

// Static method to search stores
storeSchema.statics.search = async function(searchTerm, page = 1, limit = 20) {
  try {
    const query = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { address: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
        { manager: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { name: 1 },
      collation: { locale: 'en', strength: 2 }
    };

    return await this.paginate(query, options);
  } catch (error) {
    console.error('Error searching stores:', error);
    throw error;
  }
};

// Static method to find active stores
storeSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).sort({ name: 1 });
};

const Store = mongoose.model('Store', storeSchema);

export default Store;