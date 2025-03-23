const Candidate = require('../models/Candidate');
const Election = require('../models/Election');

// @desc    Create new candidate
// @route   POST /api/candidates
// @access  Private/Admin
exports.createCandidate = async (req, res) => {
  try {
    const { name, profileImage, position, party, bio, election } = req.body;

    // Check if election exists
    const electionExists = await Election.findById(election);
    if (!electionExists) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Create candidate
    const candidate = await Candidate.create({
      name,
      profileImage,
      position,
      party,
      bio,
      election
    });

    // Add candidate to election
    electionExists.candidates.push(candidate._id);
    await electionExists.save();

    res.status(201).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all candidates
// @route   GET /api/candidates
// @access  Public
exports.getCandidates = async (req, res) => {
  try {
    // Filter by election if provided
    const filter = {};
    if (req.query.election) {
      filter.election = req.query.election;
    }

    const candidates = await Candidate.find(filter)
      .populate('election', 'title status')
      .sort('name');

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single candidate
// @route   GET /api/candidates/:id
// @access  Public
exports.getCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('election', 'title description startDate endDate status');

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update candidate
// @route   PUT /api/candidates/:id
// @access  Private/Admin
exports.updateCandidate = async (req, res) => {
  try {
    const { name, profileImage, position, party, bio } = req.body;

    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Get the election to check permissions
    const election = await Election.findById(candidate.election);
    
    // Check if user is election creator or admin
    if (election.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this candidate'
      });
    }

    // Update fields
    if (name) candidate.name = name;
    if (profileImage) candidate.profileImage = profileImage;
    if (position) candidate.position = position;
    if (party) candidate.party = party;
    if (bio) candidate.bio = bio;

    await candidate.save();

    res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete candidate
// @route   DELETE /api/candidates/:id
// @access  Private/Admin
exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Get the election to check permissions and update
    const election = await Election.findById(candidate.election);
    
    // Check if user is election creator or admin
    if (election.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this candidate'
      });
    }

    // Remove candidate from election
    election.candidates = election.candidates.filter(
      c => c.toString() !== candidate._id.toString()
    );
    await election.save();

    // Delete candidate
    await candidate.remove();

    res.status(200).json({
      success: true,
      message: 'Candidate deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 