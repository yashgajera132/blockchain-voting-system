const mongoose = require('mongoose');

const ElectionSchema = new mongoose.Schema({
  blockchainId: {
    type: Number,
    default: null
  },
  title: {
    type: String,
    required: [true, 'Please provide an election title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide an election description']
  },
  startTime: {
    type: Date,
    required: [true, 'Please provide a start time']
  },
  endTime: {
    type: Date,
    required: [true, 'Please provide an end time']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  blockchainTxHash: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidates: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      default: 'https://randomuser.me/api/portraits/lego/1.jpg'
    },
    voteCount: {
      type: Number,
      default: 0
    }
  }],
  voters: [{
    voter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    hasVoted: {
      type: Boolean,
      default: false
    },
    voteTransaction: {
      type: String,
      default: null
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Election', ElectionSchema); 