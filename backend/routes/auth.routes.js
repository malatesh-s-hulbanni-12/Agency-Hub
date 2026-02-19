const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');

// These routes are PUBLIC - no token needed
router.post('/register', register);  // For creating new users
router.post('/login', login);        // For logging in

module.exports = router;