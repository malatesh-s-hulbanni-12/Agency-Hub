const mongoose = require('mongoose'); // Add this line at the top

const itemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    unique: true
  },
  pricePerPiece: {
    type: Number,
    required: [true, 'Price per piece is required'],
    min: [0, 'Price cannot be negative']
  },
  qrCode: {
    type: String,
    required: [true, 'QR code is required'],
    unique: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
itemSchema.index({ itemName: 1 });
itemSchema.index({ qrCode: 1 });

module.exports = mongoose.model('Item', itemSchema);