# PowerShell script to start both the blockchain voting system server and client
# Run this script with administrator privileges for the best experience

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "     BLOCKCHAIN VOTING SYSTEM - PRESENTATION MODE        " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# Configuration
$rootPath = (Get-Location).Path
$serverPath = "$rootPath\server"
$clientPath = "$rootPath\client"
$logPath = "$serverPath\logs"
$logFile = "$logPath\server.log"

# Create logs directory if it doesn't exist
if (-not (Test-Path -Path $logPath)) {
    Write-Host "Creating logs directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $logPath -Force | Out-Null
}

# Function to check if a port is in use
function Test-PortInUse {
    param($port)
    
    $connections = netstat -ano | findstr ":$port "
    return $connections.Length -gt 0
}

# Check if MongoDB is running
try {
    $mongoStatus = Get-Process mongod -ErrorAction SilentlyContinue
    if ($null -eq $mongoStatus) {
        Write-Host "WARNING: MongoDB does not appear to be running!" -ForegroundColor Red
        Write-Host "Please start MongoDB before continuing." -ForegroundColor Yellow
        $startMongo = Read-Host "Would you like to attempt to start MongoDB? (y/n)"
        
        if ($startMongo -eq "y") {
            Write-Host "Attempting to start MongoDB..." -ForegroundColor Yellow
            Start-Process "mongod" -ArgumentList "--dbpath data" -NoNewWindow
            Start-Sleep -Seconds 5  # Give MongoDB time to start
            Write-Host "MongoDB starting attempt complete." -ForegroundColor Green
        }
    } else {
        Write-Host "✅ MongoDB is running." -ForegroundColor Green
    }
}
catch {
    Write-Host "Error checking MongoDB status: $_" -ForegroundColor Red
}

# Check if ports are available
$serverPort = 5001
$clientPort = 5173

if (Test-PortInUse $serverPort) {
    Write-Host "⚠️ WARNING: Port $serverPort is already in use!" -ForegroundColor Red
    Write-Host "The server may not start correctly." -ForegroundColor Yellow
}

if (Test-PortInUse $clientPort) {
    Write-Host "⚠️ WARNING: Port $clientPort is already in use!" -ForegroundColor Red
    Write-Host "The client may not start correctly." -ForegroundColor Yellow
}

# Start the server
Write-Host "Starting blockchain voting server..." -ForegroundColor Green

try {
    # Change to the server directory and start the server
    Push-Location $serverPath
    
    # Start the server as a background job
    $serverJob = Start-Job -ScriptBlock {
        param($path)
        Set-Location $path
        node server.js
    } -ArgumentList $serverPath
    
    Write-Host "✅ Server starting in background (Job ID: $($serverJob.Id))" -ForegroundColor Green
    
    # Return to the original directory
    Pop-Location
    
    # Wait for the server to initialize
    Write-Host "Waiting for server to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}
catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
    exit
}

# Start the client
Write-Host "Starting blockchain voting client..." -ForegroundColor Green

try {
    # Change to the client directory and start the client
    Push-Location $clientPath
    
    # Start the client as a background job
    $clientJob = Start-Job -ScriptBlock {
        param($path)
        Set-Location $path
        npm run dev
    } -ArgumentList $clientPath
    
    Write-Host "✅ Client starting in background (Job ID: $($clientJob.Id))" -ForegroundColor Green
    
    # Return to the original directory
    Pop-Location
}
catch {
    Write-Host "Error starting client: $_" -ForegroundColor Red
    exit
}

# Wait for client to initialize
Write-Host "Waiting for client to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Open the application in the default browser
try {
    Write-Host "Opening application in browser..." -ForegroundColor Green
    Start-Process "http://localhost:5173"
}
catch {
    Write-Host "Error opening browser: $_" -ForegroundColor Red
}

# Display instructions
Write-Host "`nBlockchain Voting System is now running!" -ForegroundColor Cyan
Write-Host "`nInstructions:" -ForegroundColor White
Write-Host "1. Server is running at: http://localhost:5001" -ForegroundColor Yellow
Write-Host "2. Client is running at: http://localhost:5173" -ForegroundColor Yellow
Write-Host "3. Use Ctrl+C to stop both server and client" -ForegroundColor Yellow

Write-Host "`nPresentation Quick Guide:" -ForegroundColor White
Write-Host "1. Register as admin (check 'Register as Administrator' box)" -ForegroundColor Yellow
Write-Host "2. Create a new election through the admin dashboard" -ForegroundColor Yellow
Write-Host "3. Open a new browser window and register as a voter" -ForegroundColor Yellow
Write-Host "4. Vote in the election you created" -ForegroundColor Yellow
Write-Host "5. View results in the admin dashboard" -ForegroundColor Yellow

# Wait for user to cancel
try {
    while ($true) {
        # Get the status of the jobs
        $serverStatus = Get-Job -Id $serverJob.Id -ErrorAction SilentlyContinue
        $clientStatus = Get-Job -Id $clientJob.Id -ErrorAction SilentlyContinue
        
        # Check if either job has stopped unexpectedly
        if ($serverStatus -eq $null -or $serverStatus.State -eq "Failed") {
            Write-Host "⚠️ Server has stopped unexpectedly!" -ForegroundColor Red
            break
        }
        
        if ($clientStatus -eq $null -or $clientStatus.State -eq "Failed") {
            Write-Host "⚠️ Client has stopped unexpectedly!" -ForegroundColor Red
            break
        }
        
        Start-Sleep -Seconds 5
    }
}
finally {
    # Clean up jobs when the script is terminated
    Write-Host "`nStopping services..." -ForegroundColor Yellow
    
    if ($serverJob) {
        Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
        Remove-Job -Job $serverJob -ErrorAction SilentlyContinue
    }
    
    if ($clientJob) {
        Stop-Job -Job $clientJob -ErrorAction SilentlyContinue
        Remove-Job -Job $clientJob -ErrorAction SilentlyContinue
    }
    
    Write-Host "All services stopped." -ForegroundColor Green
} 