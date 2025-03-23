const User = require('../models/User');
const Verification = require('../models/Verification');
const axios = require('axios');

// @desc    Upload verification documents
// @route   POST /api/verification/upload
// @access  Private
exports.uploadVerificationDocuments = async (req, res) => {
  try {
    const { idDocument, faceImage } = req.body;

    // Check for user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user with document URLs
    if (idDocument) user.idDocument = idDocument;
    if (faceImage) user.faceImage = faceImage;
    await user.save();

    // Update or create verification record
    let verification = await Verification.findOne({ user: req.user.id });
    if (!verification) {
      verification = await Verification.create({
        user: req.user.id,
        status: 'pending'
      });
    } else {
      verification.status = 'pending';
      await verification.save();
    }

    // Call AI service for document verification (asynchronously)
    // This would be a real API call to our AI service
    // For demo purposes, we're just simulating the call
    try {
      await axios.post(process.env.AI_VERIFICATION_URL || 'http://localhost:5001/api/verify', {
        userId: req.user.id,
        idDocument,
        faceImage
      });
    } catch (aiError) {
      console.error('AI Verification service error:', aiError.message);
      // Continue processing, we'll check verification status later
    }

    res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully and pending verification'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get verification status
// @route   GET /api/verification/status
// @access  Private
exports.getVerificationStatus = async (req, res) => {
  try {
    const verification = await Verification.findOne({ user: req.user.id });
    
    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: verification.status,
        faceVerified: verification.faceVerified,
        idVerified: verification.idVerified,
        aiConfidenceScore: verification.aiConfidenceScore,
        rejectionReason: verification.rejectionReason,
        createdAt: verification.createdAt,
        verifiedAt: verification.verifiedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Process AI verification callback
// @route   POST /api/verification/callback
// @access  Public (but secured with API key)
exports.processVerificationCallback = async (req, res) => {
  try {
    // This would be called by the AI service after processing
    const { userId, status, faceVerified, idVerified, confidenceScore, rejectionReason } = req.body;
    
    // Simple API key validation (should use better auth in production)
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.AI_SERVICE_API_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Find verification record
    const verification = await Verification.findOne({ user: userId });
    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification record not found'
      });
    }

    // Update verification status
    verification.status = status;
    verification.faceVerified = faceVerified;
    verification.idVerified = idVerified;
    verification.aiConfidenceScore = confidenceScore;
    
    if (status === 'rejected' && rejectionReason) {
      verification.rejectionReason = rejectionReason;
    }
    
    if (status === 'approved') {
      verification.verifiedAt = Date.now();
      
      // Update user verified status
      const user = await User.findById(userId);
      if (user) {
        user.verified = true;
        await user.save();
      }
    }

    await verification.save();

    res.status(200).json({
      success: true,
      message: 'Verification status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get verification statistics (admin only)
// @route   GET /api/verification/stats
// @access  Private/Admin
exports.getVerificationStats = async (req, res) => {
  try {
    const totalVerifications = await Verification.countDocuments();
    const approved = await Verification.countDocuments({ status: 'approved' });
    const pending = await Verification.countDocuments({ status: 'pending' });
    const rejected = await Verification.countDocuments({ status: 'rejected' });

    const recentVerifications = await Verification.find()
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        total: totalVerifications,
        approved,
        pending,
        rejected,
        approvalRate: totalVerifications > 0 ? (approved / totalVerifications) * 100 : 0,
        recentVerifications
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 