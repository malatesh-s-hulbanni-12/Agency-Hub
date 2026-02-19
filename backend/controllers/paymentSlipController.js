const PaymentSlip = require('../models/PaymentSlip');
const generateOrderId = require('../utils/generateOrderId');

// @desc    Create a new payment slip
// @route   POST /api/payment-slips
// @access  Public
const createPaymentSlip = async (req, res) => {
  try {
    // Generate order ID
    const orderId = generateOrderId();
    
    // Create new payment slip with order ID
    const paymentSlipData = {
      ...req.body,
      orderId
    };

    const paymentSlip = new PaymentSlip(paymentSlipData);
    await paymentSlip.save();

    res.status(201).json({
      success: true,
      message: 'Payment slip created successfully',
      data: paymentSlip
    });
  } catch (error) {
    console.error('Error creating payment slip:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate order ID generated. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating payment slip',
      error: error.message
    });
  }
};

// @desc    Get all payment slips
// @route   GET /api/payment-slips
// @access  Public
const getAllPaymentSlips = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort
    };

    const paymentSlips = await PaymentSlip.find()
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await PaymentSlip.countDocuments();

    res.json({
      success: true,
      data: paymentSlips,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payment slips:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment slips',
      error: error.message
    });
  }
};

// @desc    Get single payment slip by order ID
// @route   GET /api/payment-slips/:orderId
// @access  Public
const getPaymentSlipByOrderId = async (req, res) => {
  try {
    const paymentSlip = await PaymentSlip.findOne({ orderId: req.params.orderId });
    
    if (!paymentSlip) {
      return res.status(404).json({
        success: false,
        message: 'Payment slip not found'
      });
    }

    res.json({
      success: true,
      data: paymentSlip
    });
  } catch (error) {
    console.error('Error fetching payment slip:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment slip',
      error: error.message
    });
  }
};

// @desc    Update payment slip status
// @route   PATCH /api/payment-slips/:orderId/status
// @access  Public
const updatePaymentSlipStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const paymentSlip = await PaymentSlip.findOneAndUpdate(
      { orderId: req.params.orderId },
      { status },
      { new: true, runValidators: true }
    );

    if (!paymentSlip) {
      return res.status(404).json({
        success: false,
        message: 'Payment slip not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment slip status updated successfully',
      data: paymentSlip
    });
  } catch (error) {
    console.error('Error updating payment slip:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment slip',
      error: error.message
    });
  }
};

// @desc    Delete payment slip
// @route   DELETE /api/payment-slips/:orderId
// @access  Public
const deletePaymentSlip = async (req, res) => {
  try {
    const paymentSlip = await PaymentSlip.findOneAndDelete({ orderId: req.params.orderId });
    
    if (!paymentSlip) {
      return res.status(404).json({
        success: false,
        message: 'Payment slip not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment slip deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment slip:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting payment slip',
      error: error.message
    });
  }
};

// @desc    Get payment slips by date range
// @route   GET /api/payment-slips/date-range
// @access  Public
const getPaymentSlipsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const paymentSlips = await PaymentSlip.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort('-createdAt');

    res.json({
      success: true,
      data: paymentSlips
    });
  } catch (error) {
    console.error('Error fetching payment slips by date range:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment slips',
      error: error.message
    });
  }
};

module.exports = {
  createPaymentSlip,
  getAllPaymentSlips,
  getPaymentSlipByOrderId,
  updatePaymentSlipStatus,
  deletePaymentSlip,
  getPaymentSlipsByDateRange
};