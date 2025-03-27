# Blockchain Voting System

A secure and transparent electronic voting system built on blockchain technology.

## Overview

This blockchain-based voting system provides a secure, transparent, and efficient way to conduct elections. By leveraging blockchain technology, it ensures immutability of votes, transparency in the electoral process, and verification of voter eligibility while maintaining anonymity.

## Features

- **User Registration & Authentication**: Secure registration system with role-based access control
- **Blockchain Integration**: Immutable vote recording using Ethereum-based smart contracts
- **Admin Dashboard**: Complete election management interface for administrators
- **Voter Dashboard**: Easy-to-use interface for voters to participate in elections
- **Results Visualization**: Real-time visualization of election results
- **Vote Verification**: Ability for voters to verify their vote was correctly recorded

## Technology Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Blockchain**: Ethereum, Hardhat (local development), Solidity Smart Contracts
- **Authentication**: JWT, bcrypt
- **APIs**: RESTful APIs for server communication

## Project Structure

```
blockchain-voting-system/
├── client/                 # Frontend React application
├── server/                 # Backend Node.js/Express server
├── contracts/              # Solidity smart contracts
├── scripts/                # Deployment and utility scripts
└── test/                   # Test files
```

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB
- MetaMask browser extension (for blockchain interaction)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/blockchain-voting-system.git
   cd blockchain-voting-system
   ```

2. Install dependencies:
   ```
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:
   - Create `.env` file in the server directory
   - Create `.env` file in the client directory

   Example server `.env`:
   ```
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/voting-system
   JWT_SECRET=your_jwt_secret
   ```

   Example client `.env`:
   ```
   VITE_API_URL=http://localhost:5001
   VITE_VOTING_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
   VITE_ELECTION_VOTERS_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
   ```

4. Start MongoDB service:
   ```
   mongod --dbpath /path/to/data/directory
   ```

5. Start the server:
   ```
   cd server
   node server.js
   ```

6. Start the client:
   ```
   cd client
   npm run dev
   ```

### Smart Contract Deployment

1. Install Hardhat globally:
   ```
   npm install -g hardhat
   ```

2. Compile the contracts:
   ```
   npx hardhat compile
   ```

3. Deploy to local development network:
   ```
   npx hardhat node
   npx hardhat run scripts/deploy.js --network localhost
   ```

## Troubleshooting

### Common Issues

1. **Server connection problems**:
   - Verify MongoDB is running
   - Check server logs for connection errors
   - Ensure correct environment variables are set

2. **Database connectivity**:
   - Verify MongoDB connection string
   - Check MongoDB service status
   - Ensure network access to MongoDB

3. **Blockchain connection**:
   - Ensure MetaMask is installed and connected to the correct network
   - Verify contract addresses in the .env file
   - Check console for Web3 connection errors

## Presentation Guide

For a complete demonstration of the blockchain voting system, follow these steps:

1. **Register an admin account**
   - Navigate to the Sign Up page
   - Complete the registration form
   - Check the "Register as Administrator" option

2. **Create a sample election**
   - Login with admin credentials
   - Access the Admin Dashboard
   - Click "Create New Election"
   - Fill in election details and add candidates

3. **Register voter accounts**
   - Open a new browser or incognito window
   - Register as a voter

4. **Cast votes**
   - Login with voter credentials
   - Navigate to the Elections page
   - Select an active election
   - Cast your vote for a candidate

5. **View election results**
   - As an admin, view real-time results
   - Analyze participation statistics

## License

MIT License 