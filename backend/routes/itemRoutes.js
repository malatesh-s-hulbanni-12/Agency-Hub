const express = require('express');
const router = express.Router();
const {
  createItem,
  getAllItems,
  getItemById,
  getItemByQRCode,  // Make sure this is included in the import
  updateItem,
  deleteItem
} = require('../controllers/itemController');

// Routes

// GET /api/items/qr/:qrCode - Get item by QR code (place this BEFORE the /:id route)
router.get('/qr/:qrCode', getItemByQRCode);

// POST /api/items - Create new item
// GET /api/items - Get all items
router.route('/')
  .post(createItem)
  .get(getAllItems);

// GET /api/items/:id - Get item by ID
// PUT /api/items/:id - Update item
// DELETE /api/items/:id - Delete item
router.route('/:id')
  .get(getItemById)
  .put(updateItem)
  .delete(deleteItem);

module.exports = router;