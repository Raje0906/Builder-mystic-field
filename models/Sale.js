import mongoose from 'mongoose';
import AutoIncrement from 'mongoose-sequence';

const AutoIncrementFactory = AutoIncrement(mongoose);

const saleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 }
});

const saleSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  items: [saleItemSchema],
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'emi', 'bank_transfer', 'cheque'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  notes: String,
  isActive: { type: Boolean, default: true },
  saleNumber: { type: Number, unique: true }
}, { timestamps: true });

saleSchema.plugin(AutoIncrementFactory, { inc_field: 'saleNumber', start_seq: 1000 });

// Find sale by sale number
saleSchema.statics.findBySaleNumber = function(saleNumber) {
  return this.findOne({ saleNumber });
};

// Get sales statistics
saleSchema.statics.getSalesStats = function(startDate, endDate, storeId) {
  const matchStage = {
    createdAt: { $gte: startDate, $lte: endDate },
    isActive: true
  };
  if (storeId) {
    matchStage.store = new mongoose.Types.ObjectId(storeId);
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        totalItemsSold: { $sum: { $size: '$items' } }
      }
    },
    {
      $project: {
        _id: 0,
        totalSales: 1,
        totalRevenue: 1,
        totalItemsSold: 1,
        averageOrderValue: {
          $cond: [{ $eq: ['$totalSales', 0] }, 0, { $divide: ['$totalRevenue', '$totalSales'] }]
        }
      }
    }
  ]);
};

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;