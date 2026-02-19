const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  pricePerPiece: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  isManual: {
    type: Boolean,
    default: false
  }
});

const customerSchema = new mongoose.Schema({
  customerId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  }
});

const agencySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  gst: {
    type: String,
    required: true
  }
});

const saleSchema = new mongoose.Schema({
  invoiceNo: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: customerSchema,
    required: true
  },
  agency: {
    type: agencySchema,
    required: true
  },
  items: [saleItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    required: true,
    default: 5
  },
  taxAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
saleSchema.index({ invoiceNo: 1 });
saleSchema.index({ 'customer.customerId': 1 });
saleSchema.index({ date: -1 });

module.exports = mongoose.model('Sale', saleSchema);