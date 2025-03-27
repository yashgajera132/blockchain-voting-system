const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Database Connection with better error handling
console.log('Connecting to MongoDB at:', process.env.MONGODB_URI || 'mongodb://localhost:27017/blockchain-voting');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blockchain-voting', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    
    // Test database by creating a basic document
    const connection = mongoose.connection;
    connection.db.listCollections().toArray((err, collections) => {
      if (err) {
        console.error('Error checking collections:', err);
      } else {
        console.log('Available collections:', collections.map(c => c.name).join(', '));
      }
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error: ', err);
    console.error('Connection string:', process.env.MONGODB_URI || 'mongodb://localhost:27017/blockchain-voting');
  });

// Import Routes
const authRoutes = require('./routes/auth');
const electionRoutes = require('./routes/election');
const candidateRoutes = require('./routes/candidate');
const voterRoutes = require('./routes/voter');

// Route Middleware
app.use('/api/auth', authRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/voters', voterRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Blockchain Voting System API is running');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    server: 'online',
    mongodb: mongoStatus,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ API URL: http://localhost:${PORT}/api`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app; 