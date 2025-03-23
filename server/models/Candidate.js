const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a candidate name'],
    trim: true
  },
  profileImage: {
    type: String,
    default: null
  },
  position: {
    type: String,
    required: [true, 'Please provide a candidate position']
  },
  party: {
    type: String,
    default: 'Independent'
  },
  bio: {
    type: String,
    required: [true, 'Please provide candidate bio']
  },
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  voteCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Candidate', CandidateSchema); 