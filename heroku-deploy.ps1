# PowerShell script to deploy blockchain voting system to Heroku
# Requires Heroku CLI to be installed

# Parameters - change these to match your preferences
$backendAppName = "blockchain-voting-api"
$frontendAppName = "blockchain-voting-client"
$mongodbUri = "mongodb+srv://username:password@cluster.mongodb.net/blockchain-voting" # Replace with actual MongoDB URI
$jwtSecret = "blockchain-voting-secure-jwt-key-2025" # Replace with actual JWT secret

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "     BLOCKCHAIN VOTING SYSTEM - HEROKU DEPLOYMENT        " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# Check if Heroku CLI is installed
try {
    $herokuVersion = heroku --version
    Write-Host "✅ Heroku CLI detected: $herokuVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Heroku CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g heroku" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to Heroku
try {
    $herokuAccount = heroku auth:whoami
    Write-Host "✅ Logged in to Heroku as: $herokuAccount" -ForegroundColor Green
}
catch {
    Write-Host "❌ Not logged in to Heroku. Please log in:" -ForegroundColor Red
    heroku login
}

# Create backend app if it doesn't exist
try {
    $backendExists = heroku apps:info --app $backendAppName
    Write-Host "✅ Backend app '$backendAppName' already exists" -ForegroundColor Green
}
catch {
    Write-Host "Creating backend app '$backendAppName'..." -ForegroundColor Yellow
    heroku apps:create $backendAppName
}

# Create frontend app if it doesn't exist
try {
    $frontendExists = heroku apps:info --app $frontendAppName
    Write-Host "✅ Frontend app '$frontendAppName' already exists" -ForegroundColor Green
}
catch {
    Write-Host "Creating frontend app '$frontendAppName'..." -ForegroundColor Yellow
    heroku apps:create $frontendAppName
}

# Configure backend environment variables
Write-Host "Configuring backend environment variables..." -ForegroundColor Yellow
heroku config:set --app $backendAppName NODE_ENV=production
heroku config:set --app $backendAppName JWT_SECRET=$jwtSecret
heroku config:set --app $backendAppName JWT_EXPIRE=24h
heroku config:set --app $backendAppName MONGODB_URI=$mongodbUri
heroku config:set --app $backendAppName CORS_ORIGIN=https://$frontendAppName.herokuapp.com
heroku config:set --app $backendAppName CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
heroku config:set --app $backendAppName SMART_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
heroku config:set --app $backendAppName BLOCKCHAIN_RPC_URL=https://goerli.infura.io/v3/your-infura-project-id
heroku config:set --app $backendAppName ETHEREUM_NETWORK=goerli
heroku config:set --app $backendAppName ETHEREUM_RPC_URL=https://goerli.infura.io/v3/your-infura-project-id
heroku config:set --app $backendAppName AI_API_KEY=your-production-api-key
heroku config:set --app $backendAppName AI_VERIFICATION_URL=https://$backendAppName.herokuapp.com/api/verify

# Deploy backend
Write-Host "Deploying backend to Heroku..." -ForegroundColor Yellow

# Create a temporary git repo for the server
Push-Location server
git init
git add .
git config --local user.email "deployment@example.com"
git config --local user.name "Deployment Script"
git commit -m "Heroku deployment $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
heroku git:remote --app $backendAppName
git push heroku master --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
    $backendUrl = "https://$backendAppName.herokuapp.com"
    Write-Host "Backend URL: $backendUrl" -ForegroundColor Cyan
} else {
    Write-Host "❌ Backend deployment failed" -ForegroundColor Red
    exit 1
}
Pop-Location

# Create .env.production for frontend
Write-Host "Creating production environment for frontend..." -ForegroundColor Yellow
Push-Location client
@"
VITE_API_URL=https://$backendAppName.herokuapp.com
VITE_VOTING_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_ELECTION_VOTERS_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_AI_VERIFICATION_URL=https://$backendAppName.herokuapp.com/api/verify
VITE_ETHEREUM_NETWORK=goerli
VITE_BLOCK_EXPLORER_URL=https://goerli.etherscan.io
"@ | Out-File -FilePath .env.production -Encoding utf8

# Create static.json for Heroku
@"
{
  "root": "dist/",
  "clean_urls": true,
  "routes": {
    "/**": "index.html"
  }
}
"@ | Out-File -FilePath static.json -Encoding utf8

# Build the frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}

# Deploy frontend
Write-Host "Deploying frontend to Heroku..." -ForegroundColor Yellow

# Create a temporary git repo for the client
git init
git add .
git config --local user.email "deployment@example.com"
git config --local user.name "Deployment Script"
git commit -m "Heroku deployment $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
heroku git:remote --app $frontendAppName
heroku buildpacks:set heroku/nodejs
git push heroku master --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
    $frontendUrl = "https://$frontendAppName.herokuapp.com"
    Write-Host "Frontend URL: $frontendUrl" -ForegroundColor Cyan
} else {
    Write-Host "❌ Frontend deployment failed" -ForegroundColor Red
    exit 1
}
Pop-Location

# Deployment summary
Write-Host "`nDeployment Summary:" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "Backend URL: https://$backendAppName.herokuapp.com" -ForegroundColor Cyan
Write-Host "Frontend URL: https://$frontendAppName.herokuapp.com" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "`nTo open the application in your browser, run:" -ForegroundColor Yellow
Write-Host "heroku open --app $frontendAppName" -ForegroundColor White 