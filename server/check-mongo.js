const mongoose = require('mongoose');
require('dotenv').config();

// Get MongoDB connection string from .env
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blockchain-voting';

console.log(`Attempting to connect to MongoDB at: ${MONGODB_URI}`);

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    
    // Check if User model exists and create a test entry
    const User = require('./models/User');
    
    return User.create({
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      role: 'voter'
    });
  })
  .then(user => {
    console.log('✅ Test user created successfully!', user);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }); 