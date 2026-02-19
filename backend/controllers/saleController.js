const Sale = require('../models/Sale');

// Generate unique invoice number
const generateInvoiceNo = async () => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const prefix = `INV-${year}${month}`;
  
  // Find the last invoice for this month
  const lastSale = await Sale.findOne({ 
    invoiceNo: { $regex: `^${prefix}` } 
  }).sort({ invoiceNo: -1 });
  
  let sequence = 1;
  if (lastSale) {
    const lastSeq = parseInt(lastSale.invoiceNo.split('-')[2]);
    sequence = lastSeq + 1;
  }
  
  return `${prefix}-${String(sequence).padStart(4, '0')}`;
};

// @desc    Create a new sale
// @route   POST /api/sales
// @access  Public
const createSale = async (req, res) => {
  try {
    const { customer, agency, items, subtotal, taxRate, taxAmount, totalAmount } = req.body;

    // Validate required fields
    if (!customer || !agency || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Generate unique invoice number
    const invoiceNo = await generateInvoiceNo();

    // Calculate total for each item if not provided
    const processedItems = items.map(item => ({
      ...item,
      totalPrice: item.totalPrice || (item.pricePerPiece * item.quantity)
    }));

    const sale = new Sale({
      invoiceNo,
      customer,
      agency,
      items: processedItems,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      date: new Date()
    });

    await sale.save();

    res.status(201).json({
      success: true,
      message: 'Sale completed successfully',
      data: sale
    });
  } catch (error) {
    console.error('Error creating sale:', error);
    
    // Handle duplicate key error (old index or duplicate invoice)
    if (error.code === 11000) {
      // Check if it's the old saleId index
      if (error.keyPattern?.saleId) {
        try {
          // Try to drop the old saleId index
          await Sale.collection.dropIndex('saleId_1');
          console.log('✅ Old saleId index dropped successfully!');
          
          // Retry saving with new invoice number
          const newInvoiceNo = await generateInvoiceNo();
          const sale = new Sale({
            invoiceNo: newInvoiceNo,
            customer,
            agency,
            items: processedItems,
            subtotal,
            taxRate,
            taxAmount,
            totalAmount,
            date: new Date()
          });
          await sale.save();
          
          return res.status(201).json({
            success: true,
            message: 'Sale completed successfully',
            data: sale
          });
        } catch (dropError) {
          console.error('Failed to drop index:', dropError);
          return res.status(500).json({
            success: false,
            message: 'Database index error. Please try again.'
          });
        }
      }
      
      // If it's a duplicate invoice number (unlikely but possible)
      return res.status(400).json({
        success: false,
        message: 'Duplicate invoice number. Please try again.'
      });
    }
    
    // Handle validation errors
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
      message: 'Error creating sale',
      error: error.message
    });
  }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Public
const getAllSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    let query = {};
    
    // Filter by date range if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sales = await Sale.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Sale.countDocuments(query);

    res.json({
      success: true,
      data: sales,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales',
      error: error.message
    });
  }
};

// @desc    Get sale by invoice number
// @route   GET /api/sales/invoice/:invoiceNo
// @access  Public
const getSaleByInvoiceNo = async (req, res) => {
  try {
    const sale = await Sale.findOne({ invoiceNo: req.params.invoiceNo });
    
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sale',
      error: error.message
    });
  }
};

// @desc    Get single sale by ID (MongoDB _id)
// @route   GET /api/sales/:id
// @access  Public
const getSaleById = async (req, res) => {
  try {
    // Try to find by invoiceNo first (for backward compatibility)
    let sale = await Sale.findOne({ invoiceNo: req.params.id });
    
    // If not found by invoiceNo, try by MongoDB _id
    if (!sale) {
      sale = await Sale.findById(req.params.id);
    }
    
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sale',
      error: error.message
    });
  }
};

// @desc    Get sales by customer ID
// @route   GET /api/sales/customer/:customerId
// @access  Public
const getSalesByCustomer = async (req, res) => {
  try {
    const sales = await Sale.find({ 'customer.customerId': parseInt(req.params.customerId) })
      .sort({ date: -1 });

    res.json({
      success: true,
      data: sales
    });
  } catch (error) {
    console.error('Error fetching customer sales:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer sales',
      error: error.message
    });
  }
};

// @desc    Get sales statistics
// @route   GET /api/sales/stats
// @access  Public
const getSalesStats = async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      dateFilter = { date: { $gte: startOfDay } };
    } else if (period === 'week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - 7));
      dateFilter = { date: { $gte: startOfWeek } };
    } else if (period === 'month') {
      const startOfMonth = new Date(now.setMonth(now.getMonth() - 1));
      dateFilter = { date: { $gte: startOfMonth } };
    }

    const stats = await Sale.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalTax: { $sum: '$taxAmount' },
          averageSaleValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalSales: 0,
        totalRevenue: 0,
        totalTax: 0,
        averageSaleValue: 0
      }
    });
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales statistics',
      error: error.message
    });
  }
};

// @desc    Clear old index (utility function for admin use)
// @route   POST /api/sales/clear-index
// @access  Public (should be protected in production)
const clearOldIndex = async (req, res) => {
  try {
    await Sale.collection.dropIndex('saleId_1');
    res.json({
      success: true,
      message: 'Old saleId index cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing index',
      error: error.message
    });
  }
};

module.exports = {
  createSale,
  getAllSales,
  getSaleById,
  getSaleByInvoiceNo,
  getSalesByCustomer,
  getSalesStats,
  clearOldIndex
};