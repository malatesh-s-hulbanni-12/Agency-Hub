const express = require('express');
const router = express.Router();
const {
  createSale,
  getAllSales,
  getSaleById,
  getSaleByInvoiceNo,
  getSalesByCustomer,
  getSalesStats
} = require('../controllers/saleController');

// Routes
router.route('/')
  .post(createSale)
  .get(getAllSales);

router.get('/stats', getSalesStats);
router.get('/invoice/:invoiceNo', getSaleByInvoiceNo);
router.get('/customer/:customerId', getSalesByCustomer);
router.get('/:id', getSaleById);

module.exports = router;