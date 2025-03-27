# Blockchain Voting System - Presentation Guide

## Setup Instructions

Before your presentation, follow these steps to ensure everything is running smoothly:

1. **Start MongoDB**
   - Open a terminal and run: `mongod --dbpath data`
   - If MongoDB is already running as a service, you can skip this step

2. **Start the Server**
   - Navigate to the server directory: `cd server`
   - Run the server startup script: `.\start-server.ps1`
   - Alternatively, run: `node server.js`
   - The server should start on port 5001

3. **Start the Client**
   - Navigate to the client directory: `cd client`
   - Run: `npm run dev`
   - The client should start and be accessible at http://localhost:5173

4. **Quick Start Option**
   - For a more streamlined approach, use the included presentation script:
   - Run: `.\start-presentation.ps1` from the project root
   - This will start both the server and client automatically

## Presentation Flow

### 1. Introduction (2 minutes)
- Introduce the concept of blockchain voting
- Explain key advantages: security, transparency, and accessibility
- Mention the technologies used: React, Node.js, MongoDB, and Ethereum

### 2. System Architecture Demo (3 minutes)
- Show the homepage and explain the system status panel
- Demonstrate the connection between frontend, backend, and blockchain
- Explain how votes are recorded on the blockchain

### 3. Admin Functionality (5 minutes)
- Register a new admin account
- Login to the admin dashboard
- Create a new election:
  - Set election name, description, start/end dates
  - Add candidates with names and photos
  - Publish the election

### 4. Voter Experience (5 minutes)
- Open a new browser window or incognito mode
- Register a new voter account
- Navigate to the elections page
- View available elections
- Cast a vote in the election just created
- Show the verification process

### 5. Results and Transparency (3 minutes)
- Return to the admin dashboard
- View the election results
- Demonstrate how results are verifiable on the blockchain
- Show the voter participation statistics

### 6. Security Features (2 minutes)
- Explain the authentication system
- Demonstrate how voter eligibility is verified
- Highlight the immutability of the blockchain records

## Troubleshooting During Presentation

If you encounter issues during your presentation, try these quick fixes:

### Server Connection Issues
- Check if MongoDB is running with: `Get-Process mongod`
- Verify the server is running and accessible at http://localhost:5001/health
- Restart the server if needed

### Client Connection Issues
- Verify the environment variables in client/.env are correctly set
- Check browser console for connection errors
- Try refreshing the page or restarting the client

### Blockchain Connection Issues
- Ensure MetaMask extension is installed and configured
- Verify the contract addresses in client/.env are correct

## Demo Credentials

For a quick demonstration, you can use these pre-configured accounts:

**Admin Account:**
- Email: admin@example.com
- Password: admin123

**Voter Account:**
- Email: voter@example.com
- Password: voter123

## Key Features to Highlight

During your presentation, be sure to emphasize these core features:

1. **Secure Authentication**: Role-based access control
2. **Blockchain Integration**: Immutable vote recording
3. **Real-time Results**: Live updates as votes are cast
4. **User-friendly Interface**: Simple voting process for all users
5. **Transparency**: Verifiable election results 