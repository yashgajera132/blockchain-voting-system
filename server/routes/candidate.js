const express = require('express');
const router = express.Router();
const {
  createCandidate,
  getCandidates,
  getCandidate,
  updateCandidate,
  deleteCandidate
} = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getCandidates);
router.get('/:id', getCandidate);

// Admin only routes
router.post('/', protect, authorize('admin'), createCandidate);
router.put('/:id', protect, authorize('admin'), updateCandidate);
router.delete('/:id', protect, authorize('admin'), deleteCandidate);

module.exports = router; 