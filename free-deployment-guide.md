# Free Deployment Guide for Blockchain Voting System

This guide provides step-by-step instructions for deploying your blockchain voting system completely free of charge.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup with MongoDB Atlas](#database-setup-with-mongodb-atlas)
3. [Backend Deployment with Render](#backend-deployment-with-render)
4. [Frontend Deployment with Netlify](#frontend-deployment-with-netlify)
5. [Blockchain Configuration with Infura](#blockchain-configuration-with-infura)
6. [DNS Configuration (Optional)](#dns-configuration-optional)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, make sure you have:

- Git repository with your blockchain voting system code
- GitHub account (for connecting to deployment platforms)
- Google or GitHub account (for MongoDB Atlas)
- Email address (for account creation on services)

## Database Setup with MongoDB Atlas

MongoDB Atlas offers a completely free M0 tier cluster that's perfect for small applications.

1. **Create MongoDB Atlas Account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Sign up with Google, GitHub, or email

2. **Create Free Cluster**:
   - Click "Build a Database"
   - Select "FREE" option (M0 tier)
   - Choose a cloud provider and region (AWS, GCP, or Azure)
   - Click "Create Cluster" (creation takes 1-3 minutes)

3. **Configure Database Access**:
   - Click "Database Access" in left sidebar
   - Click "Add New Database User"
   - Create a username and strong password (save these!)
   - Set permissions to "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**:
   - Click "Network Access" in left sidebar
   - Click "Add IP Address"
   - For development, select "Allow Access from Anywhere" (0.0.0.0/0)
   - For better security later, add specific IPs of your deployment platforms
   - Click "Confirm"

5. **Get Connection String**:
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user's password
   - Replace `<dbname>` with "blockchain-voting"

Example: `mongodb+srv://username:mypassword@cluster0.mongodb.net/blockchain-voting?retryWrites=true&w=majority`

## Backend Deployment with Render

Render offers a free tier for web services that's perfect for your Node.js backend.

1. **Create Render Account**:
   - Go to [Render](https://render.com/) and sign up
   - Connect your GitHub account

2. **Deploy Web Service**:
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your project

3. **Configure Web Service**:
   - Name: `blockchain-voting-api`
   - Root Directory: `server` (or wherever your server code is)
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Select "Free" plan

4. **Add Environment Variables**:
   - Scroll down to the "Environment" section
   - Add all variables from your server/.env file, including:
     ```
     PORT=10000
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blockchain-voting
     JWT_SECRET=blockchain-voting-secure-jwt-key-2025
     JWT_EXPIRE=24h
     NODE_ENV=production
     CORS_ORIGIN=https://your-frontend-url.netlify.app
     BLOCKCHAIN_RPC_URL=https://goerli.infura.io/v3/your-infura-project-id
     CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
     SMART_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
     AI_API_KEY=demo-key-for-development
     AI_VERIFICATION_URL=https://your-backend-url.onrender.com/api/verify
     ETHEREUM_NETWORK=goerli
     ```
   - Note: Render automatically assigns a port, so your server should use `process.env.PORT || 5001`

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for the deployment to complete (5-10 minutes)
   - Copy your service URL (e.g., `https://blockchain-voting-api.onrender.com`)

## Frontend Deployment with Netlify

Netlify offers a generous free tier perfect for React frontend applications.

1. **Create Netlify Account**:
   - Go to [Netlify](https://www.netlify.com/) and sign up
   - Connect your GitHub account

2. **Deploy Site**:
   - Click "New site from Git"
   - Select GitHub as your Git provider
   - Select your repository
   - Configure build settings:
     - Base directory: `client` (or wherever your React code is)
     - Build command: `npm run build`
     - Publish directory: `dist` (for Vite) or `build` (for CRA)

3. **Add Environment Variables**:
   - Go to Site Settings > Build & deploy > Environment
   - Add environment variables for your frontend:
     ```
     VITE_API_URL=https://blockchain-voting-api.onrender.com
     VITE_VOTING_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
     VITE_ELECTION_VOTERS_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
     VITE_AI_VERIFICATION_URL=https://blockchain-voting-api.onrender.com/api/verify
     VITE_ETHEREUM_NETWORK=goerli
     VITE_BLOCK_EXPLORER_URL=https://goerli.etherscan.io
     ```

4. **Create Production Redirects**:
   - Create a file named `_redirects` in your client's public directory with:
     ```
     /*    /index.html   200
     ```
   - This handles client-side routing properly

5. **Deploy**:
   - Trigger a new deploy from the Deploys tab
   - Wait for deployment to complete (1-3 minutes)
   - Your site will be available at `https://your-site-name.netlify.app`

## Blockchain Configuration with Infura

For interacting with Ethereum blockchain, Infura provides a free tier.

1. **Create Infura Account**:
   - Go to [Infura](https://infura.io/) and sign up for free
   - Create a new project (e.g., "Blockchain Voting")

2. **Get Ethereum Endpoints**:
   - Select your project
   - Choose the network (Goerli or Sepolia testnet recommended for testing)
   - Copy the HTTPS endpoint (e.g., `https://goerli.infura.io/v3/your-project-id`)

3. **Update Environment Variables**:
   - Update `BLOCKCHAIN_RPC_URL` in Render with your Infura endpoint
   - Make sure frontend environment variables point to the same contract addresses

4. **Test Network with MetaMask**:
   - Ensure your smart contracts are deployed to the testnet
   - Create a MetaMask wallet if you don't have one
   - Add the testnet network to MetaMask
   - Get test ETH from a faucet like [goerlifaucet.com](https://goerlifaucet.com/)

## DNS Configuration (Optional)

For a more professional look, you can use a custom domain (many registrars offer free domains with certain packages).

1. **Register a Domain**:
   - Use Freenom for a free TLD (e.g., .tk, .ml)
   - Or purchase an affordable domain from Namecheap, GoDaddy, etc.

2. **Configure DNS for Netlify**:
   - Add your custom domain in Netlify (Site settings > Domain management)
   - Follow Netlify's instructions to update DNS settings at your registrar
   - Netlify provides free SSL certificates automatically

3. **Update CORS Settings**:
   - Update `CORS_ORIGIN` in your backend to allow your custom domain

## Post-Deployment Verification

After deployment, verify your system is working correctly:

1. **Test Backend API**:
   - Visit `https://your-backend.onrender.com/api/health`
   - You should see a JSON response with status information

2. **Test Frontend**:
   - Visit your Netlify URL
   - Ensure the frontend loads correctly
   - Test user registration and login

3. **Test Blockchain Integration**:
   - Connect MetaMask to your dApp
   - Create a test election
   - Cast a test vote
   - Verify the transaction on Etherscan

## Troubleshooting

### Backend Issues

1. **Connection Timeout to MongoDB**:
   - Verify your MongoDB connection string
   - Check if IP whitelist includes 0.0.0.0/0 or your Render IP
   - Check MongoDB Atlas status page for outages

2. **Server Crashes**:
   - Check Render logs for error messages
   - Common issue: missing environment variables
   - Ensure your server correctly uses `process.env.PORT`

### Frontend Issues

1. **API Connection Errors**:
   - Check browser console for CORS errors
   - Verify `VITE_API_URL` is correct and includes `https://`
   - Check if backend's `CORS_ORIGIN` includes your frontend URL

2. **Blockchain Connection Errors**:
   - Ensure MetaMask is installed and connected to correct network
   - Check Infura project status and rate limits
   - Verify contract addresses are correct for the network

### Database Issues

1. **Data Not Persisting**:
   - Check MongoDB connection in backend logs
   - Verify database user has write permissions
   - Check MongoDB Atlas free tier limits (512MB storage)

### Cost Optimization Tips

1. **Stay within Free Limits**:
   - MongoDB Atlas: 512MB storage limit
   - Render: 750 hours/month of runtime
   - Netlify: 100GB bandwidth/month
   - Infura: 100,000 requests/day

2. **Automatic Sleep Mode**:
   - Render free tier puts your service to sleep after 15 minutes of inactivity
   - First request after inactivity will take 30-60 seconds to wake up
   - Consider using a service like UptimeRobot to ping your API periodically

## Upgrading Later

When your project grows beyond free tiers:

1. **Database**: Upgrade to MongoDB Atlas M10 shared cluster (~$9/month)
2. **Backend**: Move to Render paid tier ($7/month) or Digital Ocean ($5/month)
3. **Smart Contracts**: Deploy to Ethereum mainnet (requires real ETH for gas)

The free setup is perfect for demonstrations, MVPs, and projects with limited users. You can easily upgrade components individually as needed. 