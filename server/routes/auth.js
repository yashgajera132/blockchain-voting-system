const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Health check endpoint for client to detect server availability
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', server: 'online', timestamp: new Date().toISOString() });
});

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router; 