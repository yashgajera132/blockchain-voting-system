const Vote = require('../models/Vote');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const Verification = require('../models/Verification');

// @desc    Cast a vote
// @route   POST /api/votes
// @access  Private
exports.castVote = async (req, res) => {
  try {
    const { electionId, candidateId, transactionHash, blockNumber } = req.body;

    // Check if election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Check if candidate exists and belongs to the election
    const candidate = await Candidate.findOne({
      _id: candidateId,
      election: electionId
    });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found in this election'
      });
    }

    // Check if election is active
    const now = new Date();
    if (now < new Date(election.startDate) || now > new Date(election.endDate) || election.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Election is not active'
      });
    }

    // Check if user is verified
    const user = await User.findById(req.user.id);
    if (!user.verified) {
      return res.status(400).json({
        success: false,
        message: 'User is not verified'
      });
    }

    // Check if user is eligible to vote in this election
    const voterIndex = election.voters.findIndex(
      v => v.voter.toString() === req.user.id
    );
    
    if (voterIndex === -1) {
      return res.status(403).json({
        success: false,
        message: 'User is not eligible to vote in this election'
      });
    }

    // Check if user has already voted
    if (election.voters[voterIndex].hasVoted) {
      return res.status(400).json({
        success: false,
        message: 'User has already voted in this election'
      });
    }

    // Create vote record
    const vote = await Vote.create({
      voter: req.user.id,
      election: electionId,
      candidate: candidateId,
      transactionHash,
      blockNumber
    });

    // Update election voter status
    election.voters[voterIndex].hasVoted = true;
    election.voters[voterIndex].voteTransaction = transactionHash;
    await election.save();

    // Increment candidate vote count
    candidate.voteCount += 1;
    await candidate.save();

    res.status(201).json({
      success: true,
      message: 'Vote cast successfully',
      data: vote
    });
  } catch (error) {
    // Check for duplicate vote error (MongoDB unique index)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate vote detected'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify vote on blockchain
// @route   POST /api/votes/verify
// @access  Public
exports.verifyVote = async (req, res) => {
  try {
    const { transactionHash } = req.body;

    // Find vote by transaction hash
    const vote = await Vote.findOne({ transactionHash })
      .populate('voter', 'name')
      .populate('election', 'title')
      .populate('candidate', 'name party');

    if (!vote) {
      return res.status(404).json({
        success: false,
        message: 'Vote not found with this transaction hash'
      });
    }

    // Here you would typically verify the transaction on blockchain
    // For now, we'll assume the transaction is valid if we found it in our database

    res.status(200).json({
      success: true,
      message: 'Vote verified successfully',
      data: {
        voterName: vote.voter.name,
        electionTitle: vote.election.title,
        candidateName: vote.candidate.name,
        candidateParty: vote.candidate.party,
        timestamp: vote.timestamp,
        transactionHash: vote.transactionHash,
        blockNumber: vote.blockNumber
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get votes for an election
// @route   GET /api/votes/election/:electionId
// @access  Private/Admin
exports.getElectionVotes = async (req, res) => {
  try {
    const { electionId } = req.params;

    // Check if election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Check if user is the election creator or admin
    if (election.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these votes'
      });
    }

    // Get votes for this election
    const votes = await Vote.find({ election: electionId })
      .populate('voter', 'name email')
      .populate('candidate', 'name party position')
      .sort('-timestamp');

    res.status(200).json({
      success: true,
      count: votes.length,
      data: votes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 