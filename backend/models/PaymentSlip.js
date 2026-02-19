const mongoose = require('mongoose');

const paymentSlipSchema = new mongoose.Schema({
  // File details
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  fileType: {
    type: String,
    required: [true, 'File type is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  fileData: {
    type: String,
    required: [true, 'File data is required']
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  
  // Seller Details
  sellerType: {
    type: String,
    enum: ['factory', 'agent'],
    required: [true, 'Seller type is required']
  },
  sellerName: {
    type: String,
    required: [true, 'Seller name is required'],
    trim: true
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  
  // Purchase Details
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  pricePerPacket: {
    type: Number,
    required: [true, 'Price per packet is required'],
    min: [0, 'Price per packet cannot be negative']
  },
  piecesPerPacket: {
    type: Number,
    required: [true, 'Pieces per packet is required'],
    min: [1, 'Pieces per packet must be at least 1']
  },
  
  // Calculated Fields
  totalPieces: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  pricePerPiece: {
    type: Number,
    required: true
  },
  
  // Buyer Details
  buyerName: {
    type: String,
    required: [true, 'Buyer name is required'],
    trim: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  
  // Order Details
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
paymentSlipSchema.index({ orderId: 1 });
paymentSlipSchema.index({ createdAt: -1 });
paymentSlipSchema.index({ sellerName: 1 });
paymentSlipSchema.index({ buyerName: 1 });

module.exports = mongoose.model('PaymentSlip', paymentSlipSchema);