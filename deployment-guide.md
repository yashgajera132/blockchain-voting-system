# Blockchain Voting System - Deployment Guide

This guide provides step-by-step instructions for deploying the blockchain voting system to various production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
   - [Option 1: Heroku Deployment](#option-1-heroku-deployment)
   - [Option 2: AWS Deployment](#option-2-aws-deployment)
   - [Option 3: Digital Ocean Deployment](#option-3-digital-ocean-deployment)
   - [Option 4: Microsoft Azure Deployment](#option-4-microsoft-azure-deployment)
3. [Smart Contract Deployment](#smart-contract-deployment)
4. [Environment Setup](#environment-setup)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- Git installed on your local machine
- Node.js (v14+) and npm installed
- MongoDB Atlas account (for cloud database)
- MetaMask wallet with Ethereum (for deploying smart contracts)
- Account on chosen hosting platform (Heroku, AWS, Digital Ocean, etc.)
- Domain name (optional but recommended)

## Deployment Options

Choose one of the following deployment options based on your requirements and budget.

### Option 1: Heroku Deployment

#### Backend Deployment

1. **Create a Heroku account** at [heroku.com](https://heroku.com) if you don't have one

2. **Install Heroku CLI**:
   ```
   npm install -g heroku
   ```

3. **Login to Heroku CLI**:
   ```
   heroku login
   ```

4. **Create a new Heroku app**:
   ```
   heroku create blockchain-voting-api
   ```

5. **Add MongoDB Atlas as an add-on** or use your existing MongoDB URI:
   ```
   heroku addons:create mongodb
   ```

6. **Configure environment variables** on Heroku:
   ```
   heroku config:set JWT_SECRET=your-very-secure-jwt-secret-key
   heroku config:set NODE_ENV=production
   heroku config:set CORS_ORIGIN=https://your-frontend-url.com
   heroku config:set CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
   heroku config:set BLOCKCHAIN_RPC_URL=https://mainnet.infura.io/v3/your-infura-project-id
   ```

7. **Deploy the backend** by pushing to Heroku:
   ```
   cd server
   git init
   git add .
   git commit -m "Initial server deployment"
   heroku git:remote -a blockchain-voting-api
   git push heroku master
   ```

#### Frontend Deployment

1. **Create a separate Heroku app for the frontend**:
   ```
   heroku create blockchain-voting-client
   ```

2. **Build the React app** with proper environment variables:
   ```
   cd client
   echo "VITE_API_URL=https://blockchain-voting-api.herokuapp.com" > .env.production
   echo "VITE_VOTING_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3" >> .env.production
   echo "VITE_ELECTION_VOTERS_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" >> .env.production
   npm run build
   ```

3. **Add a static.json file** to the client folder:
   ```json
   {
     "root": "dist/",
     "clean_urls": true,
     "routes": {
       "/**": "index.html"
     }
   }
   ```

4. **Deploy the frontend** to Heroku:
   ```
   cd client
   git init
   git add .
   git commit -m "Initial client deployment"
   heroku git:remote -a blockchain-voting-client
   git push heroku master
   ```

### Option 2: AWS Deployment

#### Backend Deployment with Elastic Beanstalk

1. **Install AWS CLI and EB CLI**:
   ```
   pip install awscli
   pip install awsebcli
   ```

2. **Configure AWS credentials**:
   ```
   aws configure
   ```

3. **Initialize EB application**:
   ```
   cd server
   eb init -p node.js blockchain-voting-api
   ```

4. **Create environment**:
   ```
   eb create blockchain-voting-prod
   ```

5. **Set environment variables**:
   ```
   eb setenv JWT_SECRET=your-very-secure-jwt-secret-key NODE_ENV=production MONGODB_URI=your-mongodb-connection-string
   ```

6. **Deploy the application**:
   ```
   eb deploy
   ```

#### Frontend Deployment with S3 + CloudFront

1. **Create S3 bucket**:
   ```
   aws s3 mb s3://blockchain-voting-client
   ```

2. **Enable static website hosting**:
   ```
   aws s3 website s3://blockchain-voting-client --index-document index.html --error-document index.html
   ```

3. **Build the React app**:
   ```
   cd client
   echo "VITE_API_URL=https://your-eb-environment-url.elasticbeanstalk.com" > .env.production
   echo "VITE_VOTING_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3" >> .env.production
   echo "VITE_ELECTION_VOTERS_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" >> .env.production
   npm run build
   ```

4. **Deploy to S3**:
   ```
   aws s3 sync dist/ s3://blockchain-voting-client
   ```

5. **Create CloudFront distribution** for HTTPS access (via AWS Console)

### Option 3: Digital Ocean Deployment

#### Using Digital Ocean App Platform

1. **Sign up for Digital Ocean** and create an account

2. **Install doctl** (Digital Ocean CLI):
   ```
   brew install doctl  # For macOS
   ```

3. **Authenticate with Digital Ocean**:
   ```
   doctl auth init
   ```

4. **Create app.yaml** configuration files for both server and client

5. **Deploy server**:
   ```
   cd server
   doctl apps create --spec app.yaml
   ```

6. **Deploy client**:
   ```
   cd client
   doctl apps create --spec app.yaml
   ```

### Option 4: Microsoft Azure Deployment

#### Backend Deployment with Azure App Service

1. **Install Azure CLI**:
   ```
   # Windows (PowerShell)
   Invoke-WebRequest -Uri https://aka.ms/installazurecliwindows -OutFile .\AzureCLI.msi
   Start-Process msiexec.exe -Wait -ArgumentList '/I AzureCLI.msi /quiet'
   ```

2. **Login to Azure**:
   ```
   az login
   ```

3. **Create a resource group**:
   ```
   az group create --name blockchain-voting-group --location eastus
   ```

4. **Create an App Service plan**:
   ```
   az appservice plan create --name blockchain-voting-plan --resource-group blockchain-voting-group --sku B1
   ```

5. **Create a web app**:
   ```
   az webapp create --name blockchain-voting-api --resource-group blockchain-voting-group --plan blockchain-voting-plan
   ```

6. **Set environment variables**:
   ```
   az webapp config appsettings set --name blockchain-voting-api --resource-group blockchain-voting-group --settings MONGODB_URI=your-mongodb-connection-string JWT_SECRET=your-jwt-secret NODE_ENV=production
   ```

7. **Deploy the backend**:
   ```
   cd server
   zip -r ../api.zip .
   az webapp deployment source config-zip --name blockchain-voting-api --resource-group blockchain-voting-group --src ../api.zip
   ```

## Smart Contract Deployment

To deploy the smart contracts to a live Ethereum network:

1. **Install Hardhat globally**:
   ```
   npm install -g hardhat
   ```

2. **Configure Hardhat for target network** (in `hardhat.config.js`):
   ```javascript
   module.exports = {
     networks: {
       // Local development network
       localhost: { ... },
       
       // Ethereum Testnet (Goerli)
       goerli: {
         url: `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`,
         accounts: [PRIVATE_KEY]
       },
       
       // Ethereum Mainnet (Production)
       mainnet: {
         url: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
         accounts: [PRIVATE_KEY]
       }
     },
     // ...
   };
   ```

3. **Deploy to chosen network**:
   ```
   # For testnet
   npx hardhat run scripts/deploy.js --network goerli
   
   # For mainnet (production)
   npx hardhat run scripts/deploy.js --network mainnet
   ```

4. **Save contract addresses** and update application configuration:
   ```
   export VITE_VOTING_CONTRACT_ADDRESS=0x...
   export VITE_ELECTION_VOTERS_ADDRESS=0x...
   ```

## Environment Setup

Ensure these environment variables are set in your production deployment:

### Backend (.env)
```
PORT=5001  # May be automatically set by hosting provider
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blockchain-voting
JWT_SECRET=your-very-secure-jwt-secret-key
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
BLOCKCHAIN_RPC_URL=https://mainnet.infura.io/v3/your-infura-project-id
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
AI_API_KEY=your-production-api-key
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend-domain.com
VITE_VOTING_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_ELECTION_VOTERS_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_AI_VERIFICATION_URL=https://your-backend-domain.com/api/verify
```

## Post-Deployment Verification

After deployment, verify the system is working correctly:

1. **Check API health endpoint**: 
   ```
   curl https://your-backend-domain.com/api/health
   ```

2. **Register a test admin account**

3. **Create a test election**

4. **Register a test voter account**

5. **Cast a test vote**

6. **Verify vote on the blockchain**

## Troubleshooting

### Common Issues

1. **CORS errors**: 
   - Ensure CORS_ORIGIN in backend environment is set to your frontend domain
   - For development, set CORS_ORIGIN=* temporarily

2. **MongoDB connection issues**:
   - Verify MongoDB URI is correct with proper username/password
   - Check IP whitelist in MongoDB Atlas settings

3. **Smart contract interaction failures**:
   - Verify contract addresses are correctly set in frontend env
   - Ensure users have MetaMask installed and connected to the correct network
   - Check if users have sufficient ETH for gas fees

4. **JWT authentication issues**:
   - Ensure JWT_SECRET is properly set
   - Verify token expiration settings

### Logs and Monitoring

- Set up logging with a service like **LogRocket** or **Sentry**
- Monitor server performance with **New Relic** or **Datadog**
- Set up alerting for critical issues

## Security Considerations

1. **Enable HTTPS** for all communication
2. **Implement rate limiting** to prevent abuse
3. **Use environment-specific variables** for different deployments
4. **Regularly update dependencies** to patch security vulnerabilities
5. **Implement proper input validation** throughout the application
6. **Store sensitive keys securely** using environment variables or secret management services 