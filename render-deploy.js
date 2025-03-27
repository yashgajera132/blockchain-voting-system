#!/usr/bin/env node

/**
 * Render Deployment Helper Script
 * 
 * This script helps prepare your blockchain voting system for deployment to Render.com
 * 
 * Usage:
 * - Run this from the project root directory
 * - Update the config section with your specific values
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// CONFIGURATION - Update these values
const config = {
  // MongoDB Atlas connection string (replace with your own)
  mongoUri: 'mongodb+srv://username:password@cluster.mongodb.net/blockchain-voting',
  
  // JWT Secret for authentication
  jwtSecret: 'blockchain-voting-secure-jwt-key-2025',
  
  // Contract addresses (update with your deployed contracts)
  contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  electionVotersAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  
  // Infura project ID (replace with your own)
  infuraProjectId: 'your-infura-project-id',
  
  // API key for AI verification (if applicable)
  aiApiKey: 'demo-key-for-development',
  
  // Render and Netlify URLs (you'll set these after deployment)
  backendUrl: 'https://blockchain-voting-api.onrender.com',
  frontendUrl: 'https://blockchain-voting.netlify.app',
  
  // Ethereum network for deployment
  ethereumNetwork: 'goerli'
};

// STEP 1: Validate project structure
console.log('\n======= BLOCKCHAIN VOTING SYSTEM - RENDER DEPLOYMENT =======');
console.log('\nStep 1: Validating project structure...');

const requiredDirectories = ['server', 'client'];
let hasErrors = false;

for (const dir of requiredDirectories) {
  if (!fs.existsSync(dir)) {
    console.error(`❌ Missing directory: ${dir}`);
    hasErrors = true;
  } else {
    console.log(`✅ Found directory: ${dir}`);
  }
}

if (hasErrors) {
  console.error('\n❌ Project structure validation failed. Please run this script from the project root.');
  process.exit(1);
}

// STEP 2: Create production configuration files
console.log('\nStep 2: Creating production configuration files...');

// Server production .env
const serverEnv = `PORT=10000
MONGODB_URI=${config.mongoUri}
JWT_SECRET=${config.jwtSecret}
JWT_EXPIRE=24h
NODE_ENV=production
CORS_ORIGIN=${config.frontendUrl}
BLOCKCHAIN_RPC_URL=https://${config.ethereumNetwork}.infura.io/v3/${config.infuraProjectId}
CONTRACT_ADDRESS=${config.contractAddress}
SMART_CONTRACT_ADDRESS=${config.contractAddress}
AI_API_KEY=${config.aiApiKey}
AI_VERIFICATION_URL=${config.backendUrl}/api/verify
ETHEREUM_NETWORK=${config.ethereumNetwork}
ETHEREUM_RPC_URL=https://${config.ethereumNetwork}.infura.io/v3/${config.infuraProjectId}`;

fs.writeFileSync(path.join('server', '.env.production'), serverEnv);
console.log('✅ Created server/.env.production');

// Client production .env
const clientEnv = `VITE_API_URL=${config.backendUrl}
VITE_VOTING_CONTRACT_ADDRESS=${config.contractAddress}
VITE_ELECTION_VOTERS_ADDRESS=${config.electionVotersAddress}
VITE_AI_VERIFICATION_URL=${config.backendUrl}/api/verify
VITE_ETHEREUM_NETWORK=${config.ethereumNetwork}
VITE_BLOCK_EXPLORER_URL=https://${config.ethereumNetwork}.etherscan.io`;

fs.writeFileSync(path.join('client', '.env.production'), clientEnv);
console.log('✅ Created client/.env.production');

// Create _redirects file for Netlify
fs.writeFileSync(path.join('client', 'public', '_redirects'), '/*    /index.html   200');
console.log('✅ Created client/public/_redirects for Netlify');

// Create render.yaml file for Render Blueprint
const renderYaml = `services:
  # Backend API service
  - type: web
    name: blockchain-voting-api
    env: node
    buildCommand: npm install
    startCommand: node server.js
    root: server
    envVars:
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        value: ${config.mongoUri}
      - key: JWT_SECRET
        value: ${config.jwtSecret}
      - key: JWT_EXPIRE
        value: 24h
      - key: NODE_ENV
        value: production
      - key: CORS_ORIGIN
        value: ${config.frontendUrl}
      - key: BLOCKCHAIN_RPC_URL
        value: https://${config.ethereumNetwork}.infura.io/v3/${config.infuraProjectId}
      - key: CONTRACT_ADDRESS
        value: ${config.contractAddress}
      - key: SMART_CONTRACT_ADDRESS
        value: ${config.contractAddress}
      - key: AI_API_KEY
        value: ${config.aiApiKey}
      - key: AI_VERIFICATION_URL
        value: ${config.backendUrl}/api/verify
      - key: ETHEREUM_NETWORK
        value: ${config.ethereumNetwork}
      - key: ETHEREUM_RPC_URL
        value: https://${config.ethereumNetwork}.infura.io/v3/${config.infuraProjectId}

  # Frontend static site (alternative to Netlify)
  - type: web
    name: blockchain-voting-client
    env: static
    buildCommand: cd ../client && npm install && npm run build
    staticPublishPath: ../client/dist
    root: server
    envVars:
      - key: VITE_API_URL
        value: ${config.backendUrl}
      - key: VITE_VOTING_CONTRACT_ADDRESS
        value: ${config.contractAddress}
      - key: VITE_ELECTION_VOTERS_ADDRESS
        value: ${config.electionVotersAddress}
      - key: VITE_AI_VERIFICATION_URL
        value: ${config.backendUrl}/api/verify
      - key: VITE_ETHEREUM_NETWORK
        value: ${config.ethereumNetwork}
      - key: VITE_BLOCK_EXPLORER_URL
        value: https://${config.ethereumNetwork}.etherscan.io`;

fs.writeFileSync('render.yaml', renderYaml);
console.log('✅ Created render.yaml for Render Blueprint deployment');

// STEP 3: Prepare server for deployment
console.log('\nStep 3: Preparing server for deployment...');

// Check if server has package.json
if (!fs.existsSync(path.join('server', 'package.json'))) {
  console.error('❌ Missing server/package.json');
  process.exit(1);
}

// Add engines to package.json to specify Node.js version
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join('server', 'package.json'), 'utf8'));
  if (!packageJson.engines) {
    packageJson.engines = { 
      "node": ">=16.0.0" 
    };
    fs.writeFileSync(
      path.join('server', 'package.json'), 
      JSON.stringify(packageJson, null, 2)
    );
    console.log('✅ Added Node.js engine specification to server/package.json');
  }
} catch (error) {
  console.error('❌ Error modifying package.json:', error);
}

// Create a Procfile for Render
fs.writeFileSync(path.join('server', 'Procfile'), 'web: node server.js');
console.log('✅ Created server/Procfile');

// STEP 4: Check for database connection code
console.log('\nStep 4: Checking database connection code...');

let serverJs = '';
try {
  serverJs = fs.readFileSync(path.join('server', 'server.js'), 'utf8');
} catch (error) {
  console.error('❌ Could not read server/server.js:', error);
  process.exit(1);
}

// Check for MongoDB connection
if (serverJs.includes('mongoose.connect')) {
  console.log('✅ MongoDB connection code found in server.js');
} else {
  console.warn('⚠️ Could not find mongoose.connect in server.js. Please ensure your server connects to MongoDB.');
}

// Check for proper port configuration
if (serverJs.includes('process.env.PORT')) {
  console.log('✅ Server uses process.env.PORT as required by Render');
} else {
  console.warn('⚠️ Server may not be using process.env.PORT. Render will automatically assign a port.');
}

// STEP 5: Print deployment instructions
console.log('\n======= DEPLOYMENT INSTRUCTIONS =======');
console.log('\n1. Push your code to GitHub (if not already done)');
console.log('2. Create a Render.com account at https://render.com');
console.log('3. Connect your GitHub repository to Render');
console.log('4. Deploy backend on Render:');
console.log('   - Create a new Web Service');
console.log('   - Select your repository');
console.log('   - Set Root Directory to "server"');
console.log('   - Set Build Command to "npm install"');
console.log('   - Set Start Command to "node server.js"');
console.log('   - Select "Free" plan');
console.log('   - Set all environment variables from server/.env.production');
console.log('5. Deploy frontend on Netlify:');
console.log('   - Go to https://app.netlify.com/start');
console.log('   - Connect to GitHub and select your repository');
console.log('   - Set Base Directory to "client"');
console.log('   - Set Build Command to "npm run build"');
console.log('   - Set Publish Directory to "dist"');
console.log('   - Set environment variables from client/.env.production');
console.log('\nAlternatively, if you have the Render CLI installed:');
console.log('   render blueprint apply');

// STEP 6: Ask if user wants to install Render CLI
rl.question('\nWould you like to install the Render CLI to deploy directly? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    console.log('\nInstalling Render CLI...');
    try {
      execSync('npm install -g @render/cli', { stdio: 'inherit' });
      console.log('✅ Render CLI installed successfully');
      console.log('\nTo deploy with Render CLI:');
      console.log('1. Log in with: render login');
      console.log('2. Deploy with: render blueprint apply');
    } catch (error) {
      console.error('❌ Failed to install Render CLI:', error);
    }
  } else {
    console.log('\nSkipping Render CLI installation. You can deploy manually using the instructions above.');
  }
  
  console.log('\n✅ Deployment preparation complete!');
  console.log('\nAfter deployment:');
  console.log(`1. Update your frontend's VITE_API_URL to your actual Render backend URL`);
  console.log(`2. Update your backend's CORS_ORIGIN to your actual Netlify frontend URL`);
  rl.close();
});

// Handle exit
rl.on('close', () => {
  console.log('\nThank you for using the Render Deployment Helper!');
  process.exit(0);
}); 