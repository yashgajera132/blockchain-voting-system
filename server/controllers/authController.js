const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Verification = require('../models/Verification');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  console.log('Registration request received:', req.body);
  
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    console.log('Checking if user already exists with email:', email);
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('User already exists with email:', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    console.log('Creating new user with role:', role || 'voter');
    let user;
    try {
      user = await User.create({
        name,
        email,
        password,
        role: role || 'voter'
      });
      console.log('User created successfully with ID:', user._id);
    } catch (userError) {
      console.error('Error creating user:', userError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account',
        error: userError.message
      });
    }

    // Create verification entry
    try {
      console.log('Creating verification entry for user:', user._id);
      await Verification.create({
        user: user._id
      });
      console.log('Verification entry created');
    } catch (verificationError) {
      console.error('Error creating verification entry:', verificationError);
      // Don't fail if verification entry creation fails
      // Just log the error and continue
    }

    // Generate token
    console.log('Generating token for user');
    const token = generateToken(user._id);

    console.log('Registration successful for:', email);
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
      error: error.stack
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, walletAddress } = req.body;

    // Find user
    const user = await User.findById(req.user.id);

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (walletAddress) user.walletAddress = walletAddress;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload verification documents
// @route   POST /api/auth/verification/upload
// @access  Private
exports.uploadVerificationDocuments = async (req, res) => {
  try {
    const { idDocument, faceImage } = req.body;

    // Update user
    const user = await User.findById(req.user.id);
    if (idDocument) user.idDocument = idDocument;
    if (faceImage) user.faceImage = faceImage;
    
    await user.save();

    // Update verification status
    const verification = await Verification.findOne({ user: user._id });
    verification.status = 'pending';
    await verification.save();

    // Here we would typically call the AI service to verify the documents
    // This would be implemented as part of the AI verification microservice
                            
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

// @desc    Check if a user exists by email
// @route   POST /api/auth/check-user
// @access  Public
exports.checkUserExists = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (user) {
      // User exists, return existence and role
      return res.status(200).json({
        success: true,
        exists: true,
        role: user.role
      });
    } else {
      // User doesn't exist
      return res.status(200).json({
        success: true,
        exists: false
      });
    }
  } catch (error) {
    console.error('Error checking user existence:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check user existence',
      error: error.message
    });
  }
}; 