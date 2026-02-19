const Item = require('../models/Item');

// @desc    Create a new item
// @route   POST /api/items
// @access  Public
const createItem = async (req, res) => {
  try {
    const { itemName, pricePerPiece, qrCode } = req.body;

    // Check if item already exists
    const existingItem = await Item.findOne({ itemName: { $regex: new RegExp(`^${itemName}$`, 'i') } });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Item with this name already exists'
      });
    }

    // Check if QR code already exists
    const existingQRCode = await Item.findOne({ qrCode });
    if (existingQRCode) {
      return res.status(400).json({
        success: false,
        message: 'QR code already exists'
      });
    }

    const item = new Item({
      itemName,
      pricePerPiece,
      qrCode
    });

    await item.save();

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item
    });
  } catch (error) {
    console.error('Error creating item:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating item',
      error: error.message
    });
  }
};

// @desc    Get all items
// @route   GET /api/items
// @access  Public
const getAllItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching items',
      error: error.message
    });
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching item',
      error: error.message
    });
  }
};

// @desc    Get item by QR code
// @route   GET /api/items/qr/:qrCode
// @access  Public
const getItemByQRCode = async (req, res) => {
  try {
    const item = await Item.findOne({ qrCode: req.params.qrCode });
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching item by QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching item by QR code',
      error: error.message
    });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Public
const updateItem = async (req, res) => {
  try {
    const { itemName, pricePerPiece, qrCode } = req.body;
    
    // Check if another item with same name exists (excluding current item)
    if (itemName) {
      const existingItem = await Item.findOne({ 
        itemName: { $regex: new RegExp(`^${itemName}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: 'Another item with this name already exists'
        });
      }
    }

    // Check if another item with same QR code exists (excluding current item)
    if (qrCode) {
      const existingQRCode = await Item.findOne({ 
        qrCode,
        _id: { $ne: req.params.id }
      });
      
      if (existingQRCode) {
        return res.status(400).json({
          success: false,
          message: 'Another item with this QR code already exists'
        });
      }
    }

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { itemName, pricePerPiece, qrCode },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating item',
      error: error.message
    });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Public
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting item',
      error: error.message
    });
  }
};

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  getItemByQRCode,
  updateItem,
  deleteItem
};