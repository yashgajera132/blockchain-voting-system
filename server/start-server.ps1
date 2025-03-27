# PowerShell script to start the blockchain voting system server
# Run this script with administrator privileges

# Configuration 
$serverPath = (Get-Location).Path
$logPath = "$serverPath\logs"
$serverFile = "$serverPath\server.js"
$logFile = "$logPath\server.log"

# Create logs directory if it doesn't exist
if (-not (Test-Path -Path $logPath)) {
    Write-Host "Creating logs directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $logPath | Out-Null
}

# Clear previous log file if it exists
if (Test-Path -Path $logFile) {
    Write-Host "Clearing previous log file..." -ForegroundColor Yellow
    Clear-Content -Path $logFile
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
            Write-Host "MongoDB starting attempt complete. Check logs for status." -ForegroundColor Green
        }
    } else {
        Write-Host "MongoDB is running." -ForegroundColor Green
    }
}
catch {
    Write-Host "Error checking MongoDB status: $_" -ForegroundColor Red
}

# Start the server
Write-Host "Starting blockchain voting server..." -ForegroundColor Green
Write-Host "Server logs will be written to: $logFile" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Yellow

try {
    # Start the server and redirect output to the log file
    Start-Process -FilePath "node" -ArgumentList $serverFile -NoNewWindow -RedirectStandardOutput $logFile -RedirectStandardError $logFile
    
    # Display the log in real-time
    Get-Content -Path $logFile -Wait
}
catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
    Write-Host "See log file for details: $logFile" -ForegroundColor Yellow
}

# Note: This script will continue running until manually stopped with Ctrl+C 