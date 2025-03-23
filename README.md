# Blockchain Voting System

A secure, transparent, and reliable electronic voting system built on blockchain technology. This application combines modern web technologies with blockchain to provide a tamper-proof voting experience with identity verification.

## Features

- **Secure Authentication**: Email and password authentication with JWT tokens
- **Blockchain Integration**: Ethereum-based voting that ensures vote immutability
- **Identity Verification**: AI-assisted verification process for voter eligibility
- **Election Management**: Create, manage, and monitor elections
- **Voting Dashboard**: User-friendly interface for casting and tracking votes
- **Admin Controls**: Comprehensive election management for administrators

## Technology Stack

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Blockchain**: Ethereum, Solidity
- **Authentication**: JWT, bcrypt
- **Identity Verification**: AI-based verification tools

## Project Structure

- `/client` - React frontend application
- `/server` - Node.js backend API
- `/blockchain` - Solidity smart contracts and deployment scripts
- `/ai-verification` - AI modules for identity verification

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB
- MetaMask wallet
- Ethereum development environment (Hardhat)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/blockchain-voting-system.git
cd blockchain-voting-system
```

2. Install dependencies for server and client
```
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Install blockchain dependencies
cd ../blockchain
npm install
```

3. Set up environment variables
   - Create `.env` files in the server, client, and blockchain directories
   - Configure MongoDB connection, JWT secret, and blockchain network settings

4. Run the application
```
# Start the server
cd server
npm run dev

# Start the client
cd ../client
npm run dev
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Ethereum](https://ethereum.org/) for blockchain infrastructure
- [React](https://reactjs.org/) for the frontend framework
- [Express](https://expressjs.com/) for the backend API
- [MongoDB](https://www.mongodb.com/) for the database 