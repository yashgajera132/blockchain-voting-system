const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const User = require('../models/User');

// @desc    Create new election
// @route   POST /api/elections
// @access  Private/Admin
exports.createElection = async (req, res) => {
  try {
    const { 
      id, 
      title, 
      description, 
      startTime, 
      endTime, 
      isActive,
      blockchainTxHash,
      candidates 
    } = req.body;

    // Create election with blockchain ID if available
    const election = await Election.create({
      blockchainId: id || null,
      title,
      description,
      startTime,
      endTime,
      isActive: isActive !== undefined ? isActive : true,
      blockchainTxHash,
      createdBy: req.user.id,
      candidates: candidates || []
    });

    res.status(201).json({
      success: true,
      data: election
    });
  } catch (error) {
    console.error('Election creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all elections
// @route   GET /api/elections
// @access  Public
exports.getElections = async (req, res) => {
  try {
    // Query parameters for filtering
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const elections = await Election.find(filter)
      .populate('createdBy', 'name email')
      .populate('candidates')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: elections.length,
      data: elections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single election
// @route   GET /api/elections/:id
// @access  Public
exports.getElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('candidates')
      .populate({
        path: 'voters.voter',
        select: 'name email verified'
      });

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    res.status(200).json({
      success: true,
      data: election
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update election
// @route   PUT /api/elections/:id
// @access  Private/Admin
exports.updateElection = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      startTime, 
      endTime, 
      isActive, 
      blockchainTxHash,
      candidates 
    } = req.body;

    let election = await Election.findById(req.params.id);

    if (!election) {
      // Try to find by blockchain ID
      election = await Election.findOne({ blockchainId: req.params.id });
      
      if (!election) {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }
    }

    // Check if user is the election creator or admin
    if (election.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this election'
      });
    }

    // Update fields
    if (title) election.title = title;
    if (description) election.description = description;
    if (startTime) election.startTime = startTime;
    if (endTime) election.endTime = endTime;
    if (isActive !== undefined) election.isActive = isActive;
    if (blockchainTxHash) election.blockchainTxHash = blockchainTxHash;
    if (candidates) election.candidates = candidates;

    await election.save();

    res.status(200).json({
      success: true,
      data: election
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update election status
// @route   PUT /api/elections/:id/status
// @access  Private/Admin
exports.updateElectionStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    let election = await Election.findById(req.params.id);

    if (!election) {
      // Try to find by blockchain ID
      election = await Election.findOne({ blockchainId: req.params.id });
      
      if (!election) {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update election status'
      });
    }

    // Update status
    election.isActive = isActive;
    await election.save();

    res.status(200).json({
      success: true,
      data: election
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete election
// @route   DELETE /api/elections/:id
// @access  Private/Admin
exports.deleteElection = async (req, res) => {
  try {
    let election = await Election.findById(req.params.id);

    if (!election) {
      // Try to find by blockchain ID
      election = await Election.findOne({ blockchainId: req.params.id });
      
      if (!election) {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }
    }

    // Check if user is the election creator or admin
    if (election.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this election'
      });
    }

    // Remove the election
    await election.remove();

    res.status(200).json({
      success: true,
      message: 'Election deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add voter to election
// @route   POST /api/elections/:id/voters
// @access  Private/Admin
exports.addVoter = async (req, res) => {
  try {
    const { voterId } = req.body;

    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Check if user exists and is a voter
    const voter = await User.findById(voterId);
    if (!voter || voter.role !== 'voter') {
      return res.status(404).json({
        success: false,
        message: 'Voter not found'
      });
    }

    // Check if voter is already added
    const isVoterAdded = election.voters.some(v => v.voter.toString() === voterId);
    if (isVoterAdded) {
      return res.status(400).json({
        success: false,
        message: 'Voter already added to this election'
      });
    }

    // Add voter to election
    election.voters.push({ voter: voterId });
    await election.save();

    res.status(200).json({
      success: true,
      message: 'Voter added to election',
      data: election
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get election results
// @route   GET /api/elections/:id/results
// @access  Public
exports.getElectionResults = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id).populate('candidates');

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Check if election has ended
    const now = new Date();
    if (now < new Date(election.endDate) && election.status !== 'ended') {
      return res.status(400).json({
        success: false,
        message: 'Election is still ongoing'
      });
    }

    // Get results from candidates
    const results = election.candidates.map(candidate => ({
      candidate: {
        id: candidate._id,
        name: candidate.name,
        party: candidate.party,
        position: candidate.position
      },
      voteCount: candidate.voteCount
    }));

    // Sort by vote count (descending)
    results.sort((a, b) => b.voteCount - a.voteCount);

    res.status(200).json({
      success: true,
      data: {
        electionId: election._id,
        title: election.title,
        status: election.status,
        totalVoters: election.voters.length,
        totalVoted: election.voters.filter(v => v.hasVoted).length,
        results
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 