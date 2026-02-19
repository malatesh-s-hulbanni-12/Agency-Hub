const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadAvatar
} = require('../controllers/user.controller');

// Make ALL routes public (no authentication needed)
router.route('/')
  .get(getUsers)      // Public
  .post(createUser);   // Public

router.route('/:id')
  .get(getUser)        // Public
  .put(updateUser)     // Public
  .delete(deleteUser); // Public

router.post('/:id/avatar', uploadAvatar); // Public

module.exports = router;