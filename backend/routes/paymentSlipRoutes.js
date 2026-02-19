const express = require('express');
const router = express.Router();
const {
  createPaymentSlip,
  getAllPaymentSlips,
  getPaymentSlipByOrderId,
  updatePaymentSlipStatus,
  deletePaymentSlip,
  getPaymentSlipsByDateRange
} = require('../controllers/paymentSlipController');
const validatePaymentSlip = require('../middleware/validatePaymentSlip');

// Routes
router.route('/')
  .post(validatePaymentSlip, createPaymentSlip)
  .get(getAllPaymentSlips);

router.get('/date-range', getPaymentSlipsByDateRange);

router.route('/:orderId')
  .get(getPaymentSlipByOrderId)
  .delete(deletePaymentSlip);

router.patch('/:orderId/status', updatePaymentSlipStatus);

module.exports = router;