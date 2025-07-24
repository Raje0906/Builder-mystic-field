import mongoose from 'mongoose';

const repairSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  deviceType: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  issueDescription: {
    type: String,
    required: true
  },
  diagnosis: String,
  repairCost: {
    type: Number,
    default: 0
  },
  partsCost: {
    type: Number,
    default: 0
  },
  laborCost: {
    type: Number,
    default: 0
  },
  totalCost: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['received', 'diagnosed', 'in_repair', 'ready_for_pickup', 'delivered', 'cancelled'],
    default: 'received'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  estimatedCompletion: Date,
  warrantyPeriod: {
    type: Number,
    default: 30
  },
  technician: String,
  notes: String,
  receivedDate: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  ticketNumber: {
    type: String,
    unique: true,
    index: true,
    required: true
  },
  updates: [{
    message: {
      type: String,
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    via: {
      whatsapp: {
        type: Boolean,
        default: false
      },
      email: {
        type: Boolean,
        default: false
      }
    }
  }]
});

// Add pre-save hook to calculate total cost
repairSchema.pre('save', function(next) {
  this.totalCost = this.repairCost + this.partsCost + this.laborCost;
  this.updatedAt = new Date();
  next();
});

// Add static methods
repairSchema.statics.findByCustomer = async function(customerId) {
  return this.find({ customer: customerId }).sort({ receivedDate: -1 });
};

repairSchema.statics.findByStatus = async function(status) {
  return this.find({ status }).sort({ receivedDate: -1 });
};

const Repair = mongoose.model('Repair', repairSchema);

export default Repair;
