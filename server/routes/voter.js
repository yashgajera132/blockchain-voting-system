const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { castVote, verifyVote, getElectionVotes } = require('../controllers/voteController');
const { 
  uploadVerificationDocuments, 
  getVerificationStatus,
  getVerificationStats 
} = require('../controllers/verificationController');

// Verification routes
router.post('/verification/upload', protect, uploadVerificationDocuments);
router.get('/verification/status', protect, getVerificationStatus);
router.get('/verification/stats', protect, authorize('admin'), getVerificationStats);

// Vote routes
router.post('/vote', protect, castVote);
router.post('/vote/verify', verifyVote);
router.get('/votes/:electionId', protect, authorize('admin'), getElectionVotes);

module.exports = router; 