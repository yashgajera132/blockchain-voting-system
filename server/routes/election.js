const express = require('express');
const router = express.Router();
const {
  createElection,
  getElections,
  getElection,
  updateElection,
  updateElectionStatus,
  deleteElection,
  addVoter,
  getElectionResults
} = require('../controllers/electionController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getElections);
router.get('/:id', getElection);
router.get('/:id/results', getElectionResults);

// Admin only routes
router.post('/', protect, authorize('admin'), createElection);
router.put('/:id', protect, authorize('admin'), updateElection);
router.put('/:id/status', protect, authorize('admin'), updateElectionStatus);
router.delete('/:id', protect, authorize('admin'), deleteElection);
router.post('/:id/voters', protect, authorize('admin'), addVoter);

module.exports = router; 